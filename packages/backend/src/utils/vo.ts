type DateMatchType = {
  createdAt: Date;
  updatedAt: Date;
};

type DateVoType = {
  createdAt: string;
  updatedAt: string;
};

export function transformDate<T extends DateMatchType>(
  date: T,
): Omit<T, "createdAt" | "updatedAt"> & DateVoType {
  return {
    ...date,
    createdAt: date.createdAt.toISOString(),
    updatedAt: date.updatedAt.toISOString(),
  };
}
