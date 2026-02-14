export type HomeCtas = {
  primaryHref: string;
  secondaryHref: string;
};

export function getHomeCtas(): HomeCtas {
  return {
    primaryHref: "#features",
    secondaryHref: "#features",
  };
}
