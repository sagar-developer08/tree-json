import React, { useState, useEffect } from "react";
import { Button, Group, Text, Badge } from "@mantine/core";
import { VscCloudDownload, VscCloudUpload, VscPulse } from "react-icons/vsc";
import useFile from "../../store/useFile";

export const ApiControls = () => {
  const { loadFromApi, saveToApi, isApiConnected, getHasChanges } = useFile();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const hasChanges = getHasChanges();

  // Check API connection on component mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const connected = await isApiConnected();
    setIsConnected(connected);
  };

  const handleLoadFromApi = async () => {
    setIsLoading(true);
    try {
      await loadFromApi();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToApi = async () => {
    setIsSaving(true);
    try {
      await saveToApi();
    } finally {
      setIsSaving(false);
    }
  };

  const getConnectionStatus = () => {
    if (isConnected === null) {
      return <Badge color="gray" size="sm">Checking...</Badge>;
    }
    return (
      <Badge 
        color={isConnected ? "green" : "red"} 
        size="sm"
        leftSection={<VscPulse size={10} />}
      >
        {isConnected ? "Connected" : "Disconnected"}
      </Badge>
    );
  };

  return (
    <Group gap="md" align="center">
      <Group gap="xs" align="center">
        <Text size="sm" c="dimmed">API Status:</Text>
        {getConnectionStatus()}
      </Group>
      
      <Group gap="xs">
        <Button
          size="sm"
          variant="light"
          color="blue"
          leftSection={<VscCloudDownload size={14} />}
          onClick={handleLoadFromApi}
          loading={isLoading}
          disabled={!isConnected}
        >
          Load from API
        </Button>
        
        <Button
          size="sm"
          variant="light"
          color="green"
          leftSection={<VscCloudUpload size={14} />}
          onClick={handleSaveToApi}
          loading={isSaving}
          disabled={!isConnected}
        >
          Save to API
          {hasChanges && <Badge color="orange" size="xs" ml="xs">●</Badge>}
        </Button>
      </Group>
      
      <Button
        size="xs"
        variant="subtle"
        onClick={checkConnection}
        disabled={isConnected === null}
      >
        Refresh
      </Button>
    </Group>
  );
}; 