import { vi } from "vitest";

export const mockDate = (date: Date): void => {
    vi.useFakeTimers();
    vi.setSystemTime(date);
};
