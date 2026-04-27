import NodeCache from "node-cache";

// stdTTL: Verinin RAM'de ne kadar kalacağı (Saniye cinsinden). 900 saniye = 15 Dakika.
// checkperiod: Süresi dolan verileri temizleme periyodu (120 saniye).
export const myCache = new NodeCache({ stdTTL: 900, checkperiod: 120 });