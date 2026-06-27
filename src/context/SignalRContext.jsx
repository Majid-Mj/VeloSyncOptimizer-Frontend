import React, { createContext, useContext, useEffect, useState } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { useSelector } from 'react-redux';

const SignalRContext = createContext(null);

export const useSignalR = () => {
  return useContext(SignalRContext);
};

export const SignalRProvider = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    if (!user) {
      if (connection) {
        connection.stop().catch(err => console.error('Error stopping SignalR connection:', err));
        setConnection(null);
      }
      return;
    }

    // Determine Hub URL based on VITE_HUB_URL or VITE_API_BASE_URL
    const baseApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5009/api';
    const hubUrl = import.meta.env.VITE_HUB_URL || (
      baseApiUrl.endsWith('/api')
        ? baseApiUrl.substring(0, baseApiUrl.length - 4) + '/hubs/stock'
        : baseApiUrl + '/hubs/stock'
    );

    console.log('Connecting to StockHub at:', hubUrl);

    const newConnection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => {
          try {
            const stored = localStorage.getItem('velosync_auth');
            if (stored) {
              const authData = JSON.parse(stored);
              return authData.accessToken || '';
            }
          } catch (e) {
            console.error('Failed to retrieve token for SignalR:', e);
          }
          return '';
        },
        withCredentials: true
      })
      .withAutomaticReconnect()
      .build();

    newConnection.start()
      .then(() => {
        console.log('Successfully connected to centralized StockHub SignalR.');
        setConnection(newConnection);
      })
      .catch((err) => {
        console.error('Error starting centralized SignalR connection:', err);
      });

    return () => {
      newConnection.stop()
        .then(() => console.log('Successfully stopped centralized StockHub.'))
        .catch(err => console.error('Error stopping centralized StockHub:', err));
    };
  }, [user]);

  return (
    <SignalRContext.Provider value={connection}>
      {children}
    </SignalRContext.Provider>
  );
};
