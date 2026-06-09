export type registerClientProps = {
  applicationDisplayName: string;
  applicationUrl: string;
  redirectUri: string;
  userId: string;
};

export type createNewApplicationPropsType = {
  applicationDisplayName: string;
  applicationUrl: string;
  redirectUri: string;
  userId: string;
  clientId: string;
  clientSecret: string;
};
