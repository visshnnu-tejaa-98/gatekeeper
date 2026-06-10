export type RegisterClientProps = {
  applicationDisplayName: string;
  applicationUrl: string;
  redirectUri: string;
  userId: string;
};

export type CreateNewApplicationPropsType = {
  applicationDisplayName: string;
  applicationUrl: string;
  redirectUri: string;
  userId: string;
  clientId: string;
  clientSecret: string;
};

export enum TokenTypeHint {
  ACCESS_TOKEN = "access_token",
  REFRESH_TOKEN = "refresh_token",
}

export type RevokeTokenProps = {
  token: string;
  token_type_hint?: TokenTypeHint;
  client_id: string;
  client_secret: string;
};

export type IntrospectTokenProps = {
  token: string;
  client_id: string;
  client_secret: string;
};
