export let DEFAULT_LANG = 'german';

export function setDefault(lang: string) {
	DEFAULT_LANG = lang;
}

export type gramFn = (num: number | string, unit: string) => string;

export type Localization = {
	months: string[];
	days: string[];
	daysLetter: string[];
	intWords: {
		beforeGram: gramFn;
		afterGram: gramFn;
		second: [string, string, string];
		minute: [string, string, string];
		hour: [string, string, string];
		day: [string, string, string];
		week: [string, string, string];
		month: [string, string, string];
		year: [string, string, string];
	};
};

// s cannot be null
export function fromString(s: string): Localization | null {
	switch (s.toLowerCase()) {
		case 'german':
		case 'de':
			return german;
		case 'english':
		case 'en':
			return english;
		case 'french':
		case 'fr':
			return french;
		default:
			return null;
	}
}

export function fromAny(a: any): Localization | null {
	if (typeof a === 'string') return fromString(a);
	if (a === null) return fromString(DEFAULT_LANG);
	// we expect it to already be a lang item (for example german)
	return a;
}

export const german: Localization = {
	months: [
		'Januar',
		'Februar',
		'März',
		'April',
		'Mai',
		'Juni',
		'Juli',
		'August',
		'September',
		'Oktober',
		'November',
		'Dezember',
	],
	days: [
		'Sonntag',
		'Montag',
		'Dienstag',
		'Mittwoch',
		'Donnerstag',
		'Freitag',
		'Samstag',
	],
	daysLetter: 'SMDMDFS'.split(''),
	intWords: {
		beforeGram: (num, unit) => `vor ${num} ${unit}`,
		afterGram: (num, unit) => `in ${num} ${unit}`,

		second: ['einer', 'Sekunde', 'Sekunden'],
		minute: ['einer', 'Minute', 'Minuten'],
		hour: ['einer', 'Stunde', 'Stunden'],
		day: ['einem', 'Tag', 'Tagen'],
		week: ['einer', 'Woche', 'Wochen'],
		month: ['einem', 'Monat', 'Monaten'],
		year: ['einem', 'Jahr', 'Jahren'],
	},
};

export const english: Localization = {
	months: [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December',
	],
	days: [
		'Sunday',
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
	],
	daysLetter: 'SMTWTFS'.split(''),
	intWords: {
		beforeGram: (num, unit) => `${num} ${unit} ago`,
		afterGram: (num, unit) => `in ${num} ${unit}`,

		second: ['one', 'second', 'seconds'],
		minute: ['one', 'minute', 'minutes'],
		hour: ['one', 'hour', 'hours'],
		day: ['one', 'day', 'days'],
		week: ['one', 'week', 'weeks'],
		month: ['one', 'month', 'months'],
		year: ['one', 'year', 'years'],
	},
};

export const french: Localization = {
	months: [
		'Janvier',
		'Février',
		'Mars',
		'Avril',
		'Mai',
		'Juin',
		'Juillet',
		'Août',
		'Septembre',
		'Octobre',
		'Novembre',
		'Décembre',
	],
	days: [
		'Dimanche',
		'Lundi',
		'Mardi',
		'Mercredi',
		'Jeudi',
		'Vendredi',
		'Samedi',
	],
	daysLetter: 'DLMMJVS'.split(''),
	intWords: {
		beforeGram: (num, unit) => `il y a ${num} ${unit}`,
		afterGram: (num, unit) => `en ${num} ${unit}`,

		second: ['une', 'seconde', 'secondes'],
		minute: ['une', 'minute', 'minutes'],
		hour: ['une', 'heure', 'heures'],
		day: ['un', 'jour', 'jours'],
		week: ['une', 'semaine', 'semaines'],
		month: ['un', 'mois', 'mois'],
		year: ['un', 'an', 'ans'],
	},
};
