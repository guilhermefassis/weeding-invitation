const TZ = "America/Sao_Paulo";

function parts(value: string) {
  const date = new Date(value);
  const get = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, ...options }).format(date);
  return { date, get };
}

/** "07 | 03 | 2026" */
export function formatDateStamp(value: string): string {
  const { get } = parts(value);
  return [
    get({ day: "2-digit" }),
    get({ month: "2-digit" }),
    get({ year: "numeric" }),
  ].join("  |  ");
}

/** "sábado, às 16h30" */
export function formatWeekdayTime(value: string): string {
  const { get } = parts(value);
  const weekday = get({ weekday: "long" });
  const time = get({ hour: "2-digit", minute: "2-digit", hour12: false }).replace(
    ":",
    "h",
  );
  return `${weekday}, às ${time}`;
}

/** "12 de dezembro de 2026" */
export function formatLongDate(value: string): string {
  const { get } = parts(value);
  return get({ day: "2-digit", month: "long", year: "numeric" });
}
