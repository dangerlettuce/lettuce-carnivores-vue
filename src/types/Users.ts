export interface User {
  user: any;
  profile: any;
  userError: any;
}

export type Profile = {
  name: {
    firstName: string;
    lastName: string;
  };
  contactInformation: {
    email: string;
  };
};
