import { ReactNode } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export const Button = ({ children, ...rest }: ButtonProps): ReactNode => {
    return <button {...rest}>{children}</button>;
};
