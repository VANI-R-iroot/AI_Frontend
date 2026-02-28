import axiosInstance from './baseUrl';
import { usePluginStore } from '../zustand/pluginStore';

export const fetchPluginList = async (userEmail: string) => {
  const {
    pluginList,
    setDomainNames,
    setPluginList,
    setFilteredList
  } = usePluginStore.getState();

  if (pluginList.length > 0) {
    return pluginList;
  }

  try {
    const res = await axiosInstance.get(`/user-trined-list?userEmail=${userEmail}`);
    const data = res.data.data;

    const flattenedAgentData = data.flatMap((item: any) =>
      item.agentTrainedData.map((agent: any) => ({ ...agent }))
    );

    const domainNames = flattenedAgentData
      .map((agent: any) => agent.domainName)
      .filter((domain: string) => domain);

    //  Cache it into Zustand
    setDomainNames(domainNames);
    setPluginList(flattenedAgentData);
    setFilteredList(flattenedAgentData);

    return flattenedAgentData;
  } catch (error) {
    console.error('Fetch failed', error);
    throw error;
  }
};

