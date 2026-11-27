// Automatic seasonal themes for major United States occasions.
//
// The active season is worked out from the calendar date in US Central time
// (the business address is in Houston). Nothing here is a promotion: messages
// are greetings. To announce a real offer, put its exact wording in `offer`
// for that season; leave it empty when there is none.

export type SeasonEffect = "none" | "snow" | "leaves" | "confetti" | "hearts" | "sparks";

export type Season = {
  id: string;
  name: string;
  // "festive" seasons restyle the site and may show a light effect.
  // "quiet" days of remembrance and long weekends show a single line only.
  tone: "festive" | "quiet";
  message: string;
  offer: string;
  effect: SeasonEffect;
  effectColors: readonly string[];
};

export const seasons: readonly Season[] = [
  {
    id: "new-year", name: "New Year", tone: "festive",
    message: "Happy New Year. Make this the year your book is published.",
    offer: "", effect: "confetti", effectColors: ["#ecc766", "#9db9ff", "#ffffff", "#c9a9ff"],
  },
  {
    id: "mlk-day", name: "Martin Luther King Jr. Day", tone: "quiet",
    message: "Today we honor the life and work of Dr. Martin Luther King Jr.",
    offer: "", effect: "none", effectColors: [],
  },
  {
    id: "valentines", name: "Valentine's Day", tone: "festive",
    message: "Happy Valentine's Day. Here's to the stories we love.",
    offer: "", effect: "hearts", effectColors: ["#e2577a", "#f29db3", "#c93a62"],
  },
  {
    id: "presidents-day", name: "Presidents' Day", tone: "quiet",
    message: "Happy Presidents' Day weekend.",
    offer: "", effect: "none", effectColors: [],
  },
  {
    id: "memorial-day", name: "Memorial Day", tone: "quiet",
    message: "This Memorial Day we remember those who gave their lives in service.",
    offer: "", effect: "none", effectColors: [],
  },
  {
    id: "juneteenth", name: "Juneteenth", tone: "quiet",
    message: "Today we recognize Juneteenth.",
    offer: "", effect: "none", effectColors: [],
  },
  {
    id: "independence-day", name: "Independence Day", tone: "festive",
    message: "Happy Fourth of July. Here's to independent voices.",
    offer: "", effect: "confetti", effectColors: ["#b22234", "#ffffff", "#3c5bbf"],
  },
  {
    id: "labor-day", name: "Labor Day", tone: "quiet",
    message: "Happy Labor Day weekend.",
    offer: "", effect: "none", effectColors: [],
  },
  {
    id: "halloween", name: "Halloween", tone: "festive",
    message: "Happy Halloween. No tricks here, just clear publishing steps.",
    offer: "", effect: "leaves", effectColors: ["#e2711d", "#7b4bb5", "#f2a23a"],
  },
  {
    id: "veterans-day", name: "Veterans Day", tone: "quiet",
    message: "Thank you to all who have served. Happy Veterans Day.",
    offer: "", effect: "none", effectColors: [],
  },
  {
    id: "thanksgiving", name: "Thanksgiving", tone: "festive",
    message: "Happy Thanksgiving. We are grateful for every author and every story.",
    offer: "", effect: "leaves", effectColors: ["#c8621b", "#a8442f", "#e0a13a", "#7a4a22"],
  },
  {
    id: "black-friday", name: "Black Friday", tone: "festive",
    message: "Black Friday weekend. Planning a book for the new year? Tell us about it.",
    offer: "", effect: "sparks", effectColors: ["#ecc766", "#fff3c4", "#d4a43a"],
  },
  {
    id: "cyber-monday", name: "Cyber Monday", tone: "festive",
    message: "Cyber Monday. Send us your manuscript details and we will map out the next steps.",
    offer: "", effect: "sparks", effectColors: ["#7fb0ff", "#c6dcff", "#5b8def"],
  },
  {
    id: "holiday-season", name: "Holiday season", tone: "festive",
    message: "Happy holidays. Give your manuscript a head start before the new year.",
    offer: "", effect: "snow", effectColors: ["#c9d8f4", "#dde8fb", "#b3c6ec"],
  },
];

export const seasonIds: readonly string[] = seasons.map((season) => season.id);

export function seasonById(id: string | null | undefined): Season | null {
  return seasons.find((season) => season.id === id) ?? null;
}

// Self-contained on purpose: this function's source is also inlined into the
// page <head> so the theme is set before first paint. Do not reference
// anything outside the function body. month is 1-12.
export function resolveSeason(year: number, month: number, day: number): string | null {
  function weekday(y: number, m: number, d: number) {
    return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  }
  function nthWeekday(y: number, m: number, target: number, n: number) {
    const first = weekday(y, m, 1);
    return 1 + ((target - first + 7) % 7) + (n - 1) * 7;
  }
  function lastWeekday(y: number, m: number, target: number) {
    const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const last = weekday(y, m, daysInMonth);
    return daysInMonth - ((last - target + 7) % 7);
  }
  // Day number within the year, so ranges that cross a month are easy to compare.
  function ordinal(m: number, d: number) {
    return Math.round((Date.UTC(year, m - 1, d) - Date.UTC(year, 0, 1)) / 86400000);
  }
  const today = ordinal(month, day);
  function within(startMonth: number, startDay: number, endMonth: number, endDay: number) {
    return today >= ordinal(startMonth, startDay) && today <= ordinal(endMonth, endDay);
  }

  // New Year: December 26 to January 2.
  if ((month === 12 && day >= 26) || (month === 1 && day <= 2)) return "new-year";

  const thanksgiving = nthWeekday(year, 11, 4, 4);
  // Monday to Thursday of Thanksgiving week.
  if (within(11, thanksgiving - 3, 11, thanksgiving)) return "thanksgiving";
  // Friday to Sunday.
  if (within(11, thanksgiving + 1, 11, thanksgiving + 3)) return "black-friday";
  if (today === ordinal(11, thanksgiving + 4)) return "cyber-monday";
  // From the day after Cyber Monday to Christmas Day.
  if (today > ordinal(11, thanksgiving + 4) && today <= ordinal(12, 25)) return "holiday-season";

  if (month === 1 && day === nthWeekday(year, 1, 1, 3)) return "mlk-day";
  if (within(2, 8, 2, 14)) return "valentines";
  const presidents = nthWeekday(year, 2, 1, 3);
  if (within(2, presidents - 2, 2, presidents)) return "presidents-day";
  const memorial = lastWeekday(year, 5, 1);
  if (within(5, memorial - 2, 5, memorial)) return "memorial-day";
  if (month === 6 && day === 19) return "juneteenth";
  if (within(7, 1, 7, 4)) return "independence-day";
  const labor = nthWeekday(year, 9, 1, 1);
  if (within(9, labor - 2, 9, labor)) return "labor-day";
  if (within(10, 24, 10, 31)) return "halloween";
  if (month === 11 && day === 11) return "veterans-day";

  return null;
}

// Script for the page <head>. It reads today's date in US Central time, lets
// ?season=<id> (or ?season=off) override it for previews, and sets
// data-season on <html> before anything is painted.
export function seasonBootstrapScript(): string {
  return `(function(){try{var ids=${JSON.stringify(seasonIds)};var resolve=${resolveSeason.toString()};var root=document.documentElement;var q=new URLSearchParams(location.search).get("season");var id=null;if(q==="off"){id=null}else if(q&&ids.indexOf(q)>-1){id=q}else{var p=new Intl.DateTimeFormat("en-US",{timeZone:"America/Chicago",year:"numeric",month:"numeric",day:"numeric"}).formatToParts(new Date());var v={};for(var i=0;i<p.length;i++){v[p[i].type]=parseInt(p[i].value,10)}id=resolve(v.year,v.month,v.day)}if(id){root.setAttribute("data-season",id)}try{if(sessionStorage.getItem("season-dismissed")===id&&id){root.setAttribute("data-season-dismissed","")}}catch(e){}}catch(e){}})();`;
}
