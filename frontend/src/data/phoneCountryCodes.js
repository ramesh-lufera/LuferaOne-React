// Shared calling codes display the flag of the first listed country.
const phoneCountryCodes = `
1|United States / Canada / Caribbean|US
7|Russia / Kazakhstan|RU
20|Egypt|EG
27|South Africa|ZA
30|Greece|GR
31|Netherlands|NL
32|Belgium|BE
33|France|FR
34|Spain|ES
36|Hungary|HU
39|Italy / Vatican City|IT
40|Romania|RO
41|Switzerland|CH
43|Austria|AT
44|United Kingdom / Guernsey / Isle of Man / Jersey|GB
45|Denmark|DK
46|Sweden|SE
47|Norway / Svalbard and Jan Mayen|NO
48|Poland|PL
49|Germany|DE
51|Peru|PE
52|Mexico|MX
53|Cuba|CU
54|Argentina|AR
55|Brazil|BR
56|Chile|CL
57|Colombia|CO
58|Venezuela|VE
60|Malaysia|MY
61|Australia / Christmas Island / Cocos Islands|AU
62|Indonesia|ID
63|Philippines|PH
64|New Zealand / Pitcairn Islands|NZ
65|Singapore|SG
66|Thailand|TH
81|Japan|JP
82|South Korea|KR
84|Vietnam|VN
86|China|CN
90|Turkey|TR
91|India|IN
92|Pakistan|PK
93|Afghanistan|AF
94|Sri Lanka|LK
95|Myanmar|MM
98|Iran|IR
211|South Sudan|SS
212|Morocco / Western Sahara|MA
213|Algeria|DZ
216|Tunisia|TN
218|Libya|LY
220|Gambia|GM
221|Senegal|SN
222|Mauritania|MR
223|Mali|ML
224|Guinea|GN
225|Côte d’Ivoire|CI
226|Burkina Faso|BF
227|Niger|NE
228|Togo|TG
229|Benin|BJ
230|Mauritius|MU
231|Liberia|LR
232|Sierra Leone|SL
233|Ghana|GH
234|Nigeria|NG
235|Chad|TD
236|Central African Republic|CF
237|Cameroon|CM
238|Cape Verde|CV
239|São Tomé and Príncipe|ST
240|Equatorial Guinea|GQ
241|Gabon|GA
242|Republic of the Congo|CG
243|Democratic Republic of the Congo|CD
244|Angola|AO
245|Guinea-Bissau|GW
246|British Indian Ocean Territory|IO
247|Ascension Island|AC
248|Seychelles|SC
249|Sudan|SD
250|Rwanda|RW
251|Ethiopia|ET
252|Somalia|SO
253|Djibouti|DJ
254|Kenya|KE
255|Tanzania|TZ
256|Uganda|UG
257|Burundi|BI
258|Mozambique|MZ
260|Zambia|ZM
261|Madagascar|MG
262|Réunion / Mayotte|RE
263|Zimbabwe|ZW
264|Namibia|NA
265|Malawi|MW
266|Lesotho|LS
267|Botswana|BW
268|Eswatini|SZ
269|Comoros|KM
290|Saint Helena / Tristan da Cunha|SH
291|Eritrea|ER
297|Aruba|AW
298|Faroe Islands|FO
299|Greenland|GL
350|Gibraltar|GI
351|Portugal|PT
352|Luxembourg|LU
353|Ireland|IE
354|Iceland|IS
355|Albania|AL
356|Malta|MT
357|Cyprus|CY
358|Finland / Åland Islands|FI
359|Bulgaria|BG
370|Lithuania|LT
371|Latvia|LV
372|Estonia|EE
373|Moldova|MD
374|Armenia|AM
375|Belarus|BY
376|Andorra|AD
377|Monaco|MC
378|San Marino|SM
380|Ukraine|UA
381|Serbia|RS
382|Montenegro|ME
383|Kosovo|XK
385|Croatia|HR
386|Slovenia|SI
387|Bosnia and Herzegovina|BA
389|North Macedonia|MK
420|Czechia|CZ
421|Slovakia|SK
423|Liechtenstein|LI
500|Falkland Islands / South Georgia and South Sandwich Islands|FK
501|Belize|BZ
502|Guatemala|GT
503|El Salvador|SV
504|Honduras|HN
505|Nicaragua|NI
506|Costa Rica|CR
507|Panama|PA
508|Saint Pierre and Miquelon|PM
509|Haiti|HT
590|Guadeloupe / Saint Barthélemy / Saint Martin|GP
591|Bolivia|BO
592|Guyana|GY
593|Ecuador|EC
594|French Guiana|GF
595|Paraguay|PY
596|Martinique|MQ
597|Suriname|SR
598|Uruguay|UY
599|Curaçao / Caribbean Netherlands|CW
670|Timor-Leste|TL
672|Norfolk Island / Australian Antarctic Territory|NF
673|Brunei|BN
674|Nauru|NR
675|Papua New Guinea|PG
676|Tonga|TO
677|Solomon Islands|SB
678|Vanuatu|VU
679|Fiji|FJ
680|Palau|PW
681|Wallis and Futuna|WF
682|Cook Islands|CK
683|Niue|NU
685|Samoa|WS
686|Kiribati|KI
687|New Caledonia|NC
688|Tuvalu|TV
689|French Polynesia|PF
690|Tokelau|TK
691|Micronesia|FM
692|Marshall Islands|MH
850|North Korea|KP
852|Hong Kong|HK
853|Macao|MO
855|Cambodia|KH
856|Laos|LA
880|Bangladesh|BD
886|Taiwan|TW
960|Maldives|MV
961|Lebanon|LB
962|Jordan|JO
963|Syria|SY
964|Iraq|IQ
965|Kuwait|KW
966|Saudi Arabia|SA
967|Yemen|YE
968|Oman|OM
970|Palestine|PS
971|United Arab Emirates|AE
972|Israel|IL
973|Bahrain|BH
974|Qatar|QA
975|Bhutan|BT
976|Mongolia|MN
977|Nepal|NP
992|Tajikistan|TJ
993|Turkmenistan|TM
994|Azerbaijan|AZ
995|Georgia|GE
996|Kyrgyzstan|KG
998|Uzbekistan|UZ
`.trim().split('\n').map((entry) => {
  const [code, country, region] = entry.split('|');
  const flag = String.fromCodePoint(...[...region].map((letter) => 127397 + letter.charCodeAt(0)));
  return { code: `+${code}`, country, flag };
});

export default phoneCountryCodes;
