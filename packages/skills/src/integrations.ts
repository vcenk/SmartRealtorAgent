export type IntegrationSkillStub = {
  name: string;
  status: 'stub';
  description: string;
};

export const integrationSkillStubs: IntegrationSkillStub[] = [
  {
    name: 'integrations.mls.searchListings',
    status: 'stub',
    description: 'Placeholder for MLS search integration.',
  },
  {
    name: 'integrations.crm.pushLead',
    status: 'stub',
    description: 'Placeholder for CRM lead sync integration.',
  },
  {
    name: 'integrations.sms.send',
    status: 'stub',
    description: 'Placeholder for SMS messaging integration.',
  },
];
