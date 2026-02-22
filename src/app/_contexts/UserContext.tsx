"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
} from "react";

export interface UserContextType {
    phoneNumber: string | null;
    setPhoneNumber: (phoneNumber: string) => void;
}

const UserContext = createContext<UserContextType>({
    phoneNumber: null,
    setPhoneNumber: () => { },
});

interface UserProviderProps {
    children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
    const [phoneNumber, setPhoneNumberState] = useState<string | null>(null);

    const setPhoneNumber = useCallback((phone: string) => {
        setPhoneNumberState(phone);
    }, []);

    const value: UserContextType = {
        phoneNumber,
        setPhoneNumber,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserContext(): UserContextType {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUserContext must be used within a UserProvider");
    }
    return context;
}
