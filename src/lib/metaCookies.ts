// lib/meta-cookies.ts
export const getMetaCookies = () => {
  const cookies = document.cookie.split(";").reduce(
    (acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    },
    {} as Record<string, string>,
  );

  return {
    fbp: cookies["_fbp"], // always present if pixel loaded
    fbc: cookies["_fbc"], // only present after ad click
  };
};
