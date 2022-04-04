export interface CustomerAuthenticate
{
    authorities: string[];
    role: string;
    session: {
        accessToken: string;
        created: string;
        expiry: string;
        ownerId: string;
        refreshToken: string;
        username: string;
    }
    sessionType: string;
}