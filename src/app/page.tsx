"use client";
import { useState, useEffect, useCallback, useMemo, useRef, Fragment } from "react";

/* ═══════════════════════════════════════════════════════════════
   WorkSchedulerLite — Staff Scheduling for Small Companies
   Design: Apple Liquid Glass · DM Sans · 3 Themes
   Holiday DB: 52 countries (Europe, ME, LatAm, Africa)
   ═══════════════════════════════════════════════════════════════ */

// ─── CONSTANTS ────────────────────────────────────────────────
const F = "'DM Sans',system-ui,-apple-system,sans-serif";
const MAX_SHIFTS = 25, MAX_EMPS = 25, MAX_MONTHS_AHEAD = 3;

const G = {
  r: 16, rS: 12, rXs: 8, rL: 24,
  blur: "saturate(180%) blur(16px)",
  blurS: "saturate(140%) blur(10px)",
};

const PAL = {
  navy: "#0f1d3d", blue: "#3b6de6", sky: "#5b9aff", gold: "#f5a623",
  mint: "#3ddba4", rose: "#e8466d", violet: "#7c5ce0", white: "#ffffff",
  red: "#dc2626", green: "#059669", orange: "#f97316",
};

// 25 distinct shift colors
const SHIFT_COLORS = [
  "#3b6de6","#059669","#e8466d","#f5a623","#7c5ce0",
  "#06b6d4","#ec4899","#84cc16","#f97316","#6366f1",
  "#14b8a6","#ef4444","#a855f7","#eab308","#0ea5e9",
  "#d946ef","#22c55e","#f43f5e","#8b5cf6","#64748b",
  "#2dd4bf","#fb923c","#818cf8","#4ade80","#f472b6",
];


// ─── TIPURI CONCEDIU IMPLICITE (România) ─────────────────────
const DEFAULT_LEAVES = [
  {id:"lv_co",name:"Concediu de Odihnă",color:"#22c55e",short:"CO"},
  {id:"lv_cm",name:"Concediu Medical",color:"#ef4444",short:"CM"},
  {id:"lv_mat",name:"Concediu Maternitate",color:"#ec4899",short:"MAT"},
  {id:"lv_pat",name:"Concediu Paternitate",color:"#6366f1",short:"PAT"},
  {id:"lv_cc",name:"Concediu Creștere Copil",color:"#a855f7",short:"CCC"},
  {id:"lv_cb",name:"Concediu Îngrijire Copil Bolnav",color:"#f43f5e",short:"CCB"},
  {id:"lv_fp",name:"Concediu Fără Plată",color:"#64748b",short:"FP"},
  {id:"lv_ev",name:"Concediu Evenimente Familiale",color:"#f59e0b",short:"EV"},
  {id:"lv_form",name:"Concediu Formare Profesională",color:"#06b6d4",short:"FP"},
  {id:"lv_rm",name:"Concediu Risc Maternal",color:"#d946ef",short:"RM"},
  {id:"lv_ig",name:"Concediu de Îngrijitor",color:"#14b8a6",short:"IG"},
  {id:"lv_fm",name:"Absență Forță Majoră",color:"#78716c",short:"FM"},
  {id:"lv_acc",name:"Concediu Accident de Muncă",color:"#dc2626",short:"ACC"},
  {id:"lv_bp",name:"Concediu Boală Profesională",color:"#b91c1c",short:"BP"},
];

// ─── THEMES ───────────────────────────────────────────────────
const TH = {
  light: {
    id:"light",lb:"Light",ic:"☀️",
    bg:"linear-gradient(145deg,#f0f4fa 0%,#e6ecf5 50%,#dfe7f4 100%)",
    gbg:"rgba(255,255,255,0.55)",gbd:"rgba(255,255,255,0.75)",gbh:"rgba(255,255,255,0.8)",
    card:"rgba(255,255,255,0.72)",cardS:"0 4px 24px rgba(15,29,61,0.06)",
    hdr:"rgba(255,255,255,0.72)",hdrS:"0 1px 0 rgba(15,29,61,0.06)",
    tx:"#0f1d3d",t2:"#4a5578",t3:"#8892ab",
    bd:"rgba(15,29,61,0.08)",bd2:"rgba(15,29,61,0.04)",
    ac:PAL.blue,acS:"rgba(59,109,230,0.1)",acG:"linear-gradient(135deg,#3b6de6,#5b9aff)",
    acSh:"0 4px 20px rgba(59,109,230,0.25)",
    ok:"#059669",okBg:"rgba(5,150,105,0.08)",
    er:"#dc2626",erBg:"rgba(220,38,38,0.06)",
    warn:"#f97316",warnBg:"rgba(249,115,22,0.08)",
    inputBg:"rgba(255,255,255,0.7)",inputBd:"rgba(15,29,61,0.1)",
    cellBg:"rgba(255,255,255,0.45)",cellHov:"rgba(255,255,255,0.7)",
    holBg:"rgba(220,38,38,0.06)",holTx:"#dc2626",
    wkndBg:"rgba(15,29,61,0.03)",
    todayBd:"rgba(59,109,230,0.4)",
  },
  dark: {
    id:"dark",lb:"Dark",ic:"🌙",
    bg:"linear-gradient(145deg,#080c18 0%,#0d1224 50%,#111828 100%)",
    gbg:"rgba(17,24,40,0.65)",gbd:"rgba(91,154,255,0.08)",gbh:"rgba(91,154,255,0.12)",
    card:"rgba(17,24,40,0.7)",cardS:"0 4px 24px rgba(0,0,0,0.3)",
    hdr:"rgba(8,12,24,0.85)",hdrS:"0 1px 0 rgba(255,255,255,0.04)",
    tx:"#e8ecf4",t2:"#8a96b0",t3:"#4c5b78",
    bd:"rgba(255,255,255,0.06)",bd2:"rgba(255,255,255,0.03)",
    ac:"#5b9aff",acS:"rgba(91,154,255,0.12)",acG:"linear-gradient(135deg,#5b9aff,#3b6de6)",
    acSh:"0 4px 20px rgba(91,154,255,0.2)",
    ok:"#3ddba4",okBg:"rgba(61,219,164,0.1)",
    er:"#f87171",erBg:"rgba(248,113,113,0.1)",
    warn:"#fb923c",warnBg:"rgba(251,146,60,0.1)",
    inputBg:"rgba(17,24,40,0.6)",inputBd:"rgba(255,255,255,0.08)",
    cellBg:"rgba(17,24,40,0.4)",cellHov:"rgba(91,154,255,0.08)",
    holBg:"rgba(248,113,113,0.08)",holTx:"#f87171",
    wkndBg:"rgba(255,255,255,0.02)",
    todayBd:"rgba(91,154,255,0.4)",
  },
  rose: {
    id:"rose",lb:"Rosé",ic:"🌸",
    bg:"linear-gradient(145deg,#fdf2f8 0%,#fce7f3 50%,#f5e6f0 100%)",
    gbg:"rgba(255,255,255,0.5)",gbd:"rgba(236,72,153,0.12)",gbh:"rgba(236,72,153,0.18)",
    card:"rgba(255,255,255,0.65)",cardS:"0 4px 24px rgba(236,72,153,0.08)",
    hdr:"rgba(255,255,255,0.65)",hdrS:"0 1px 0 rgba(236,72,153,0.06)",
    tx:"#4a1d3d",t2:"#7a4a6a",t3:"#a88a9d",
    bd:"rgba(236,72,153,0.1)",bd2:"rgba(236,72,153,0.05)",
    ac:"#ec4899",acS:"rgba(236,72,153,0.1)",acG:"linear-gradient(135deg,#ec4899,#f472b6)",
    acSh:"0 4px 20px rgba(236,72,153,0.25)",
    ok:"#059669",okBg:"rgba(5,150,105,0.08)",
    er:"#dc2626",erBg:"rgba(220,38,38,0.06)",
    warn:"#f97316",warnBg:"rgba(249,115,22,0.08)",
    inputBg:"rgba(255,255,255,0.6)",inputBd:"rgba(236,72,153,0.12)",
    cellBg:"rgba(255,255,255,0.4)",cellHov:"rgba(236,72,153,0.08)",
    holBg:"rgba(220,38,38,0.06)",holTx:"#dc2626",
    wkndBg:"rgba(236,72,153,0.03)",
    todayBd:"rgba(236,72,153,0.4)",
  },
};

// ─── TRADUCERI (doar Română) ──────────────────────────────────
const TX = {
  ro: {
    appName:"WorkSchedulerLite",tagline:"Programarea personalului simplificată",
    createCompany:"Creează Companie",joinCompany:"Accesează Companie",
    companyName:"Numele companiei",country:"Țara",schedule:"Program de lucru",
    monFri:"Luni – Vineri",allWeek:"Toată săptămâna (Lun–Dum)",
    operatingDays:"Zile de funcționare",workingHours:"Program de lucru",
    closed:"Închis",allDay:"Toată ziua",
    create:"Creează",adminPin:"PIN Administrator",enterPin:"Introdu PIN-ul de admin",
    access:"Accesează",enterCode:"Introdu codul companiei",
    employees:"Angajați",shifts:"Ture",calendar:"Calendar",
    addEmployee:"Adaugă Angajat",addShift:"Creează Tură",
    empName:"Numele angajatului",empRole:"Rol (opțional)",empHours:"Ore/zi",
    contracted:"Contractate",allocated:"Alocate",ptoDays:"Zile CO/an",ptoRemaining:"CO Rămas",ptoUsed:"CO Folosit",
    startDate:"Data angajării",endDate:"Ultima zi lucrătoare",terminateEmp:"Încetare contract",terminated:"Încheiat",active:"Activ",terminateConfirm:"Confirmă încetarea contractului pentru",
    uncoveredDays:"Zile Neacoperite",noneUncovered:"Toate zilele de lucru sunt acoperite!",
    coverageReport:"Raport Acoperire",
    shiftName:"Numele turei",startTime:"Ora de start",endTime:"Ora de sfârșit",
    save:"Salvează",cancel:"Anulează",delete:"Șterge",edit:"Editează",
    today:"Astăzi",month:"Lună",week:"Săptămână",
    prevMonth:"Luna anterioară",nextMonth:"Luna următoare",
    hours:"ore",hoursWeek:"ore/săpt",overtime:"Ore suplimentare",
    conflict:"Conflict",noShifts:"Nicio tură încă",noEmployees:"Niciun angajat încă",
    assignShift:"Selectează un angajat, apoi o tură, apoi apasă pe zilele din calendar",
    removeShift:"Click dreapta sau apăsare lungă pentru a șterge",
    shareLink:"Partajează Link",adminLink:"Link Administrator",memberLink:"Link Angajat",
    copied:"Copiat!",copyLink:"Copiază link",
    yourSchedule:"Programul Tău",teamSchedule:"Programul Echipei",
    selectShift:"Selectează o tură de atribuit",
    clearDay:"Golește ziua",
    weeklyHours:"Ore Săptămânale",totalHours:"Total Ore",
    export:"Export",print:"Printează",settings:"Setări",
    about:"Despre",holiday:"Sărbătoare",nonWorking:"Zi nelucrătoare",
    copyWeek:"Copiază Săptămâna",weekCopied:"Program copiat!",
    maxShifts:"Maxim 25 ture atins",maxEmps:"Maxim 25 angajați atins",
    confirmDelete:"Ești sigur că vrei să ștergi?",
    qrCode:"Cod QR",scanToAccess:"Scanează pentru a accesa programul",
    back:"Înapoi",close:"Închide",
    scheduleFor:"Program pentru",
    mon:"Lun",tue:"Mar",wed:"Mie",thu:"Joi",fri:"Vin",sat:"Sâm",sun:"Dum",
    monFull:"Luni",tueFull:"Marți",wedFull:"Miercuri",
    thuFull:"Joi",friFull:"Vineri",satFull:"Sâmbătă",sunFull:"Duminică",
    jan:"Ianuarie",feb:"Februarie",mar:"Martie",apr:"Aprilie",may:"Mai",jun:"Iunie",
    jul:"Iulie",aug:"August",sep:"Septembrie",oct:"Octombrie",nov:"Noiembrie",dec:"Decembrie",
    theme:"Temă",language:"Limbă",
    poweredBy:"Creat cu grijă pentru echipele care prețuiesc simplitatea",
    dragDrop:"Apasă pe zilele din calendar pentru a atribui",
    summary:"Rezumat",overview:"Privire generală",
    totalShifts:"Total Ture",avgHours:"Ore Medii/Săpt",
    coverage:"Acoperire",
    noSchedule:"Nicio tură atribuită încă",
    welcome:"Bine ai venit la WorkSchedulerLite",
    getStarted:"Creează compania ta pentru a începe",
    orAccess:"Sau accesează o companie existentă",
    features:"Funcționalități",
    f1:"Până la 25 angajați",f2:"25 tipuri de ture",f3:"Sărbători legale RO",
    f4:"Programare drag & drop",f5:"Link-uri individuale angajați",f6:"Fără cont necesar",
    recentCompanies:"Companii Recente",
    adminSettings:"Setări Companie",deleteCompany:"Șterge Compania",
    confirmDeleteCompany:"Ești sigur? Toate datele vor fi șterse.",
    normalHours:"Ore Normale",overtimeHours:"Ore Suplimentare",holidayHours:"Ore Sărbători (x2)",
    companySettings:"Setări",
    leaves:"Concedii",addLeave:"Creează Concediu",leaveName:"Tip concediu",
    noLeaves:"Niciun concediu încă",leaveTypes:"Tipuri de Concediu",
  },
  en:{
    appName:"WorkSchedulerLite",tagline:"Simple staff scheduling for small companies",
    createCompany:"Create Company",joinCompany:"Access Company",companyName:"Company Name",
    country:"Country",
    monFri:"Monday – Friday",allWeek:"All week (Mon–Sun)",
    operatingDays:"Operating Days",workingHours:"Work Schedule",
    closed:"Closed",allDay:"All day",
    create:"Create",adminPin:"Admin PIN",enterPin:"Enter admin PIN",
    access:"Access",enterCode:"Enter company code",
    employees:"Employees",shifts:"Shifts",calendar:"Calendar",
    addEmployee:"Add Employee",addShift:"Create Shift",
    empName:"Employee name",empRole:"Role (optional)",empHours:"Hours/day",
    contracted:"Contracted",allocated:"Allocated",ptoDays:"PTO days/year",ptoRemaining:"PTO Remaining",ptoUsed:"PTO Used",
    startDate:"Start date",endDate:"Last working day",terminateEmp:"Terminate contract",terminated:"Terminated",active:"Active",terminateConfirm:"Confirm contract termination for",
    uncoveredDays:"Uncovered Days",noneUncovered:"All working days are covered!",
    coverageReport:"Coverage Report",
    shiftName:"Shift name",startTime:"Start time",endTime:"End time",
    save:"Save",cancel:"Cancel",delete:"Delete",edit:"Edit",
    today:"Today",month:"Month",week:"Week",
    prevMonth:"Previous month",nextMonth:"Next month",
    hours:"hours",hoursWeek:"hours/week",overtime:"Overtime",
    conflict:"Conflict",noShifts:"No shifts yet",noEmployees:"No employees yet",
    assignShift:"Select an employee, then a shift, then click on calendar days",
    removeShift:"Right-click or long press to remove",
    shareLink:"Share Link",adminLink:"Admin Link",memberLink:"Employee Link",
    copied:"Copied!",copyLink:"Copy link",
    yourSchedule:"Your Schedule",teamSchedule:"Team Schedule",
    selectShift:"Select a shift to assign",
    clearDay:"Clear day",
    weeklyHours:"Weekly Hours",totalHours:"Total Hours",
    export:"Export",print:"Print",settings:"Settings",
    about:"About",holiday:"Holiday",nonWorking:"Non-working day",
    copyWeek:"Copy Week",weekCopied:"Schedule copied!",
    maxShifts:"Maximum 25 shifts reached",maxEmps:"Maximum 25 employees reached",
    confirmDelete:"Are you sure you want to delete?",
    qrCode:"QR Code",scanToAccess:"Scan to access the schedule",
    back:"Back",close:"Close",
    scheduleFor:"Schedule for",
    mon:"Mon",tue:"Tue",wed:"Wed",thu:"Thu",fri:"Fri",sat:"Sat",sun:"Sun",
    monFull:"Monday",tueFull:"Tuesday",wedFull:"Wednesday",
    thuFull:"Thursday",friFull:"Friday",satFull:"Saturday",sunFull:"Sunday",
    jan:"January",feb:"February",mar:"March",apr:"April",may:"May",jun:"June",
    jul:"July",aug:"August",sep:"September",oct:"October",nov:"November",dec:"December",
    theme:"Theme",language:"Language",
    poweredBy:"Built with care for teams that value simplicity",
    dragDrop:"Click on calendar days to assign",
    summary:"Summary",overview:"Overview",
    totalShifts:"Total Shifts",avgHours:"Avg Hours/Week",
    coverage:"Coverage",
    noSchedule:"No shifts assigned yet",
    welcome:"Welcome to WorkSchedulerLite",
    getStarted:"Create your company to get started",
    orAccess:"Or access an existing company",
    features:"Features",
    f1:"Up to 25 employees",f2:"25 shift types",f3:"Romanian public holidays",
    f4:"CSV, Excel, PDF export",f5:"Individual employee links",f6:"PIN-secured access",
    recentCompanies:"Recent Companies",
    adminSettings:"Company Settings",deleteCompany:"Delete Company",
    confirmDeleteCompany:"Are you sure? All data will be deleted.",
    normalHours:"Normal Hours",overtimeHours:"Overtime Hours",holidayHours:"Holiday Hours (x2)",
    companySettings:"Settings",
    leaves:"Leaves",addLeave:"Create Leave",leaveName:"Leave type",
    noLeaves:"No leaves yet",leaveTypes:"Leave Types",
  },
};

// ─── HOLIDAY DATABASE (52 Countries) ──────────────────────────
// Easter computation (Western & Orthodox)
function easterWestern(y){let a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=(h+l-7*m+114)%31+1;return new Date(y,mo-1,da)}
function easterOrthodox(y){let a=y%4,b=y%7,c=y%19,d=(19*c+15)%30,e=(2*a+4*b-d+34)%7,mo=Math.floor((d+e+114)/31),da=(d+e+114)%31+1;let jd=da,jm=mo;let cent=Math.floor(y/100),adj=cent-Math.floor(cent/4)-2;jd+=adj;if(jd>30&&jm===3){jd-=31;jm=4}else if(jd>30&&jm===4){jd-=30;jm=5}else if(jd>31&&jm===3){jd-=31;jm=4}return new Date(y,jm-1,jd)}

// Islamic holiday estimator (base 2026, ~-10.63 days/year shift)
function islamicHolidays(y,base2026){
  const shift=Math.round((y-2026)*-10.63);
  return base2026.map(([m,d,name])=>{
    const dt=new Date(2026,m-1,d);
    dt.setDate(dt.getDate()+shift);
    dt.setFullYear(y);
    return {m:dt.getMonth()+1,d:dt.getDate(),name};
  });
}

// Fixed holidays per country: [month, day, name]
const FIXED = {
  AT:[[1,1,"New Year"],[1,6,"Epiphany"],[5,1,"Labour Day"],[8,15,"Assumption"],[10,26,"National Day"],[11,1,"All Saints"],[12,8,"Immaculate Conception"],[12,25,"Christmas"],[12,26,"St Stephen"]],
  BE:[[1,1,"New Year"],[5,1,"Labour Day"],[7,21,"National Day"],[8,15,"Assumption"],[11,1,"All Saints"],[11,11,"Armistice"],[12,25,"Christmas"]],
  BG:[[1,1,"New Year"],[3,3,"Liberation Day"],[5,1,"Labour Day"],[5,6,"St George"],[5,24,"Culture Day"],[9,6,"Unification"],[9,22,"Independence"],[12,24,"Christmas Eve"],[12,25,"Christmas"],[12,26,"Christmas 2"]],
  HR:[[1,1,"New Year"],[1,6,"Epiphany"],[5,1,"Labour Day"],[5,30,"Statehood"],[6,22,"Anti-Fascist"],[8,5,"Victory Day"],[8,15,"Assumption"],[11,1,"All Saints"],[11,18,"Remembrance"],[12,25,"Christmas"],[12,26,"St Stephen"]],
  CY:[[1,1,"New Year"],[1,6,"Epiphany"],[3,25,"Greek Independence"],[4,1,"Cyprus National"],[5,1,"Labour Day"],[8,15,"Assumption"],[10,1,"Independence"],[10,28,"Ochi Day"],[12,25,"Christmas"],[12,26,"Boxing Day"]],
  CZ:[[1,1,"New Year"],[5,1,"Labour Day"],[5,8,"Liberation"],[7,5,"Cyril & Methodius"],[7,6,"Jan Hus"],[9,28,"Statehood"],[10,28,"Independence"],[11,17,"Freedom Day"],[12,24,"Christmas Eve"],[12,25,"Christmas"],[12,26,"St Stephen"]],
  DK:[[1,1,"New Year"],[6,5,"Constitution"],[12,24,"Christmas Eve"],[12,25,"Christmas"],[12,26,"2nd Christmas"]],
  EE:[[1,1,"New Year"],[2,24,"Independence"],[5,1,"Spring Day"],[6,23,"Victory Day"],[6,24,"Midsummer"],[8,20,"Restoration"],[12,24,"Christmas Eve"],[12,25,"Christmas"],[12,26,"Boxing Day"]],
  FI:[[1,1,"New Year"],[1,6,"Epiphany"],[5,1,"May Day"],[6,20,"Midsummer Eve"],[12,6,"Independence"],[12,24,"Christmas Eve"],[12,25,"Christmas"],[12,26,"Boxing Day"]],
  FR:[[1,1,"New Year"],[5,1,"Labour Day"],[5,8,"Victory Day"],[7,14,"Bastille Day"],[8,15,"Assumption"],[11,1,"All Saints"],[11,11,"Armistice"],[12,25,"Christmas"]],
  DE:[[1,1,"New Year"],[5,1,"Labour Day"],[10,3,"Unity Day"],[12,25,"Christmas"],[12,26,"2nd Christmas"]],
  GR:[[1,1,"New Year"],[1,6,"Epiphany"],[3,25,"Independence"],[5,1,"Labour Day"],[8,15,"Assumption"],[10,28,"Ochi Day"],[12,25,"Christmas"],[12,26,"2nd Christmas"]],
  HU:[[1,1,"New Year"],[3,15,"Revolution Day"],[5,1,"Labour Day"],[8,20,"St Stephen"],[10,23,"Republic Day"],[11,1,"All Saints"],[12,25,"Christmas"],[12,26,"2nd Christmas"]],
  IE:[[1,1,"New Year"],[2,3,"St Brigid"],[3,17,"St Patrick"],[5,5,"May Holiday"],[6,2,"June Holiday"],[8,4,"August Holiday"],[10,27,"October Holiday"],[12,25,"Christmas"],[12,26,"St Stephen"]],
  IT:[[1,1,"New Year"],[1,6,"Epiphany"],[4,25,"Liberation"],[5,1,"Labour Day"],[6,2,"Republic Day"],[8,15,"Assumption"],[11,1,"All Saints"],[12,8,"Immaculate Conception"],[12,25,"Christmas"],[12,26,"St Stephen"]],
  LV:[[1,1,"New Year"],[5,1,"Labour Day"],[5,4,"Restoration"],[6,23,"Midsummer Eve"],[6,24,"Midsummer"],[11,18,"Independence"],[12,24,"Christmas Eve"],[12,25,"Christmas"],[12,26,"2nd Christmas"],[12,31,"New Year Eve"]],
  LT:[[1,1,"New Year"],[2,16,"Restoration"],[3,11,"Independence"],[5,1,"Labour Day"],[6,24,"Midsummer"],[7,6,"Statehood"],[8,15,"Assumption"],[11,1,"All Saints"],[11,2,"All Souls"],[12,24,"Christmas Eve"],[12,25,"Christmas"],[12,26,"2nd Christmas"]],
  LU:[[1,1,"New Year"],[5,1,"Labour Day"],[6,23,"National Day"],[8,15,"Assumption"],[11,1,"All Saints"],[12,25,"Christmas"],[12,26,"St Stephen"]],
  MT:[[1,1,"New Year"],[2,10,"St Paul Shipwreck"],[3,19,"St Joseph"],[3,31,"Freedom Day"],[5,1,"Labour Day"],[6,7,"Sette Giugno"],[6,29,"St Peter & Paul"],[8,15,"Assumption"],[9,8,"Our Lady"],[9,21,"Independence"],[12,8,"Immaculate Conception"],[12,13,"Republic Day"],[12,25,"Christmas"]],
  NL:[[1,1,"New Year"],[4,27,"King's Day"],[5,5,"Liberation"],[12,25,"Christmas"],[12,26,"2nd Christmas"]],
  PL:[[1,1,"New Year"],[1,6,"Epiphany"],[5,1,"Labour Day"],[5,3,"Constitution"],[8,15,"Armed Forces"],[11,1,"All Saints"],[11,11,"Independence"],[12,25,"Christmas"],[12,26,"2nd Christmas"]],
  PT:[[1,1,"New Year"],[4,25,"Freedom Day"],[5,1,"Labour Day"],[6,10,"Portugal Day"],[8,15,"Assumption"],[10,5,"Republic Day"],[11,1,"All Saints"],[12,1,"Restoration"],[12,8,"Immaculate Conception"],[12,25,"Christmas"]],
  RO:[[1,1,"New Year"],[1,2,"New Year 2"],[1,24,"Union Day"],[5,1,"Labour Day"],[6,1,"Children's Day"],[8,15,"Assumption"],[11,30,"St Andrew"],[12,1,"National Day"],[12,25,"Christmas"],[12,26,"2nd Christmas"]],
  SK:[[1,1,"New Year"],[1,6,"Epiphany"],[5,1,"Labour Day"],[5,8,"Victory Day"],[7,5,"Cyril & Methodius"],[8,29,"Slovak Uprising"],[9,1,"Constitution"],[9,15,"Our Lady"],[11,1,"All Saints"],[11,17,"Freedom Day"],[12,24,"Christmas Eve"],[12,25,"Christmas"],[12,26,"St Stephen"]],
  SI:[[1,1,"New Year"],[1,2,"New Year 2"],[2,8,"Prešeren Day"],[4,27,"Resistance Day"],[5,1,"Labour Day"],[5,2,"Labour Day 2"],[6,25,"Statehood"],[8,15,"Assumption"],[10,31,"Reformation"],[11,1,"All Saints"],[12,25,"Christmas"],[12,26,"Independence"]],
  ES:[[1,1,"New Year"],[1,6,"Epiphany"],[5,1,"Labour Day"],[8,15,"Assumption"],[10,12,"National Day"],[11,1,"All Saints"],[12,6,"Constitution"],[12,8,"Immaculate Conception"],[12,25,"Christmas"]],
  SE:[[1,1,"New Year"],[1,6,"Epiphany"],[5,1,"Labour Day"],[6,6,"National Day"],[6,20,"Midsummer Eve"],[12,24,"Christmas Eve"],[12,25,"Christmas"],[12,26,"Boxing Day"],[12,31,"New Year Eve"]],
  GB:[[1,1,"New Year"],[4,3,"Good Friday"],[4,6,"Easter Monday"],[5,4,"May Bank"],[5,25,"Spring Bank"],[8,31,"Summer Bank"],[12,25,"Christmas"],[12,26,"Boxing Day"]],
  CH:[[1,1,"New Year"],[1,2,"Berchtold"],[8,1,"National Day"],[12,25,"Christmas"],[12,26,"St Stephen"]],
  NO:[[1,1,"New Year"],[5,1,"Labour Day"],[5,17,"Constitution"],[12,25,"Christmas"],[12,26,"Boxing Day"]],
  IS:[[1,1,"New Year"],[5,1,"Labour Day"],[6,17,"Independence"],[8,3,"Commerce Day"],[12,24,"Christmas Eve"],[12,25,"Christmas"],[12,26,"2nd Christmas"],[12,31,"New Year Eve"]],
  RS:[[1,1,"New Year"],[1,2,"New Year 2"],[1,7,"Orthodox Christmas"],[2,15,"Statehood"],[2,16,"Statehood 2"],[5,1,"Labour Day"],[5,2,"Labour Day 2"],[11,11,"Armistice"]],
  BA:[[1,1,"New Year"],[1,2,"New Year 2"],[5,1,"Labour Day"],[5,2,"Labour Day 2"],[11,25,"Statehood"]],
  ME:[[1,1,"New Year"],[1,2,"New Year 2"],[5,1,"Labour Day"],[5,2,"Labour Day 2"],[5,21,"Independence"],[5,22,"Independence 2"],[7,13,"Statehood"],[7,14,"Statehood 2"]],
  MK:[[1,1,"New Year"],[5,1,"Labour Day"],[5,24,"Cyril & Methodius"],[8,2,"Republic Day"],[9,8,"Independence"],[10,11,"Revolution"],[10,23,"Revolution Day"],[12,8,"St Clement"]],
  AL:[[1,1,"New Year"],[1,2,"New Year 2"],[3,14,"Summer Day"],[3,22,"Nowruz"],[5,1,"Labour Day"],[11,28,"Independence"],[11,29,"Liberation"],[12,8,"Youth Day"],[12,25,"Christmas"]],
  XK:[[1,1,"New Year"],[2,17,"Independence"],[5,1,"Labour Day"],[5,9,"Europe Day"],[12,25,"Christmas"]],
  MD:[[1,1,"New Year"],[1,7,"Orthodox Christmas"],[1,8,"Orthodox Christmas 2"],[3,8,"Women's Day"],[5,1,"Labour Day"],[5,9,"Victory Day"],[6,1,"Children's Day"],[8,27,"Independence"],[8,31,"Language Day"],[12,25,"Christmas"]],
  UA:[[1,1,"New Year"],[1,7,"Orthodox Christmas"],[3,8,"Women's Day"],[5,1,"Labour Day"],[5,9,"Victory Day"],[6,28,"Constitution"],[8,24,"Independence"],[10,14,"Defenders Day"],[12,25,"Christmas"]],
  BY:[[1,1,"New Year"],[1,7,"Orthodox Christmas"],[3,8,"Women's Day"],[5,1,"Labour Day"],[5,9,"Victory Day"],[7,3,"Independence"],[11,7,"Revolution Day"],[12,25,"Catholic Christmas"]],
  TR:[[1,1,"New Year"],[4,23,"Sovereignty"],[5,1,"Labour Day"],[5,19,"Youth Day"],[7,15,"Democracy Day"],[8,30,"Victory Day"],[10,29,"Republic Day"]],
  AD:[[1,1,"New Year"],[1,6,"Epiphany"],[3,14,"Constitution"],[5,1,"Labour Day"],[8,15,"Assumption"],[9,8,"Our Lady"],[11,1,"All Saints"],[12,8,"Immaculate Conception"],[12,25,"Christmas"],[12,26,"St Stephen"]],
  MC:[[1,1,"New Year"],[1,27,"St Devota"],[5,1,"Labour Day"],[8,15,"Assumption"],[11,1,"All Saints"],[11,19,"National Day"],[12,8,"Immaculate Conception"],[12,25,"Christmas"]],
  SM:[[1,1,"New Year"],[2,5,"St Agatha"],[3,25,"Anniversary"],[4,1,"Captains Regent"],[5,1,"Labour Day"],[7,28,"Liberation"],[9,3,"Republic Day"],[10,1,"Captains Regent"],[11,1,"All Saints"],[11,2,"All Souls"],[12,8,"Immaculate Conception"],[12,25,"Christmas"],[12,26,"St Stephen"]],
  LI:[[1,1,"New Year"],[1,6,"Epiphany"],[2,2,"Candlemas"],[5,1,"Labour Day"],[8,15,"Assumption"],[9,8,"Our Lady"],[11,1,"All Saints"],[12,8,"Immaculate Conception"],[12,24,"Christmas Eve"],[12,25,"Christmas"],[12,26,"St Stephen"],[12,31,"New Year Eve"]],
  SA:[[2,22,"Founding Day"],[9,23,"National Day"]],
  AE:[[1,1,"New Year"],[12,1,"Commemoration"],[12,2,"National Day"],[12,3,"National Day 2"]],
  CL:[[1,1,"New Year"],[5,1,"Labour Day"],[5,21,"Navy Day"],[6,29,"St Peter & Paul"],[7,16,"Our Lady"],[8,15,"Assumption"],[9,18,"Independence"],[9,19,"Army Day"],[10,12,"Columbus Day"],[10,31,"Reformation"],[11,1,"All Saints"],[12,8,"Immaculate Conception"],[12,25,"Christmas"]],
  BR:[[1,1,"New Year"],[4,21,"Tiradentes"],[5,1,"Labour Day"],[9,7,"Independence"],[10,12,"Our Lady"],[11,2,"All Souls"],[11,15,"Republic Day"],[12,25,"Christmas"]],
  MA:[[1,1,"New Year"],[1,11,"Independence Manifesto"],[5,1,"Labour Day"],[7,30,"Throne Day"],[8,14,"Oued Ed-Dahab"],[8,20,"Revolution Day"],[8,21,"Youth Day"],[11,6,"Green March"],[11,18,"Independence"]],
  KZ:[[1,1,"New Year"],[1,2,"New Year 2"],[3,8,"Women's Day"],[3,21,"Nauryz"],[3,22,"Nauryz 2"],[3,23,"Nauryz 3"],[5,1,"Unity Day"],[5,7,"Defenders Day"],[5,9,"Victory Day"],[7,6,"Capital Day"],[8,30,"Constitution"],[10,25,"Republic Day"],[12,16,"Independence"],[12,17,"Independence 2"]],
  BH:[[1,1,"New Year"],[5,1,"Labour Day"],[12,16,"National Day"],[12,17,"National Day 2"]],
};

// Easter-based holidays per country: [offset from Easter, name]
const EASTER_RULES = {
  AT:[[-2,"Good Friday"],[1,"Easter Monday"],[39,"Ascension"],[50,"Whit Monday"],[60,"Corpus Christi"]],
  BE:[[-2,"Good Friday"],[1,"Easter Monday"],[39,"Ascension"],[50,"Whit Monday"]],
  BG:[],  // Orthodox Easter
  HR:[[-2,"Good Friday"],[1,"Easter Monday"],[60,"Corpus Christi"]],
  CY:[[-2,"Good Friday"],[1,"Easter Monday"],[50,"Whit Monday"]],  // Orthodox
  CZ:[[-2,"Good Friday"],[1,"Easter Monday"]],
  DK:[[-3,"Maundy Thu"],[-2,"Good Friday"],[1,"Easter Monday"],[26,"Great Prayer"],[39,"Ascension"],[50,"Whit Monday"]],
  EE:[[-2,"Good Friday"],[50,"Whit Sunday"]],
  FI:[[-2,"Good Friday"],[1,"Easter Monday"],[39,"Ascension"],[50,"Whit Sunday"]],
  FR:[[-2,"Good Friday"],[1,"Easter Monday"],[39,"Ascension"],[50,"Whit Monday"]],
  DE:[[-2,"Good Friday"],[1,"Easter Monday"],[39,"Ascension"],[50,"Whit Monday"]],
  GR:[],  // Orthodox
  HU:[[-2,"Good Friday"],[1,"Easter Monday"],[50,"Whit Monday"]],
  IE:[[-2,"Good Friday"],[1,"Easter Monday"]],
  IT:[[-2,"Good Friday"],[1,"Easter Monday"]],
  LV:[[-2,"Good Friday"],[1,"Easter Monday"]],
  LT:[[-2,"Good Friday"],[1,"Easter Monday"]],
  LU:[[-2,"Good Friday"],[1,"Easter Monday"],[39,"Ascension"],[50,"Whit Monday"]],
  MT:[[-2,"Good Friday"]],
  NL:[[-2,"Good Friday"],[1,"Easter Monday"],[39,"Ascension"],[50,"Whit Monday"]],
  PL:[[-2,"Good Friday"],[1,"Easter Monday"],[60,"Corpus Christi"]],
  PT:[[-2,"Good Friday"],[1,"Easter Monday"],[60,"Corpus Christi"]],
  RO:[],  // Orthodox
  SK:[[-2,"Good Friday"],[1,"Easter Monday"]],
  SI:[[-2,"Good Friday"],[1,"Easter Monday"],[50,"Whit Sunday"]],
  ES:[[-3,"Maundy Thu"],[-2,"Good Friday"]],
  SE:[[-2,"Good Friday"],[1,"Easter Monday"],[39,"Ascension"],[50,"Whit Sunday"]],
  GB:[],  // Already in fixed
  CH:[[-2,"Good Friday"],[1,"Easter Monday"],[39,"Ascension"],[50,"Whit Monday"]],
  NO:[[-3,"Maundy Thu"],[-2,"Good Friday"],[1,"Easter Monday"],[39,"Ascension"],[49,"Whit Sunday"],[50,"Whit Monday"]],
  IS:[[-3,"Maundy Thu"],[-2,"Good Friday"],[1,"Easter Monday"],[39,"Ascension"],[50,"Whit Monday"]],
  RS:[],  // Orthodox
  BA:[],
  ME:[],
  MK:[],
  AL:[],
  XK:[],
  MD:[],
  UA:[],
  BY:[],
  TR:[],
  AD:[[-2,"Good Friday"],[1,"Easter Monday"],[39,"Ascension"],[50,"Whit Monday"]],
  MC:[[-2,"Good Friday"],[1,"Easter Monday"],[39,"Ascension"],[50,"Whit Monday"],[60,"Corpus Christi"]],
  SM:[[-2,"Good Friday"],[1,"Easter Monday"],[60,"Corpus Christi"]],
  LI:[[-2,"Good Friday"],[1,"Easter Monday"],[39,"Ascension"],[50,"Whit Monday"],[60,"Corpus Christi"]],
  CL:[[-2,"Good Friday"],[-1,"Holy Saturday"]],
  BR:[[-49,"Carnival Mon"],[-48,"Carnival Tue"],[-2,"Good Friday"],[60,"Corpus Christi"]],
  MA:[],
  KZ:[],
  BH:[],
  SA:[],
  AE:[],
};

// Orthodox Easter countries
const ORTHODOX_COUNTRIES = new Set(["BG","RO","RS","GR","CY","MD","UA","BY","ME","MK","GE"]);

// Islamic holiday base dates (2026) for countries that observe them
const ISLAMIC_BASE_2026 = {
  TR:[[3,20,"Eid al-Fitr"],[3,21,"Eid al-Fitr 2"],[3,22,"Eid al-Fitr 3"],[5,27,"Eid al-Adha"],[5,28,"Eid al-Adha 2"],[5,29,"Eid al-Adha 3"],[5,30,"Eid al-Adha 4"]],
  SA:[[3,20,"Eid al-Fitr"],[3,21,"Eid al-Fitr 2"],[3,22,"Eid al-Fitr 3"],[5,27,"Eid al-Adha"],[5,28,"Eid al-Adha 2"],[5,29,"Eid al-Adha 3"],[5,30,"Eid al-Adha 4"]],
  AE:[[3,20,"Eid al-Fitr"],[3,21,"Eid al-Fitr 2"],[3,22,"Eid al-Fitr 3"],[5,26,"Arafat Day"],[5,27,"Eid al-Adha"],[5,28,"Eid al-Adha 2"],[5,29,"Eid al-Adha 3"],[6,16,"Hijri New Year"],[8,25,"Prophet Birthday"]],
  MA:[[3,20,"Eid al-Fitr"],[3,21,"Eid al-Fitr 2"],[5,27,"Eid al-Adha"],[5,28,"Eid al-Adha 2"],[5,29,"Eid al-Adha 3"],[5,30,"Eid al-Adha 4"],[6,16,"Hijri New Year"],[8,25,"Prophet Birthday"]],
  BH:[[3,20,"Eid al-Fitr"],[3,21,"Eid al-Fitr 2"],[3,22,"Eid al-Fitr 3"],[5,26,"Arafat Day"],[5,27,"Eid al-Adha"],[5,28,"Eid al-Adha 2"],[5,29,"Eid al-Adha 3"],[6,16,"Hijri New Year"],[7,25,"Ashura"],[7,26,"Ashura 2"],[8,25,"Prophet Birthday"]],
  BA:[[3,20,"Eid al-Fitr"],[3,21,"Eid al-Fitr 2"],[5,27,"Eid al-Adha"],[5,28,"Eid al-Adha 2"]],
  AL:[[3,20,"Eid al-Fitr"],[5,27,"Eid al-Adha"]],
  XK:[[3,20,"Eid al-Fitr"],[5,27,"Eid al-Adha"]],
  MK:[[3,20,"Eid al-Fitr"],[5,27,"Eid al-Adha"]],
};

// Country data: name, flag, code
const COUNTRIES = [
  {code:"AT",name:"Austria",flag:"🇦🇹"},{code:"BE",name:"Belgium",flag:"🇧🇪"},
  {code:"BG",name:"Bulgaria",flag:"🇧🇬"},{code:"HR",name:"Croatia",flag:"🇭🇷"},
  {code:"CY",name:"Cyprus",flag:"🇨🇾"},{code:"CZ",name:"Czechia",flag:"🇨🇿"},
  {code:"DK",name:"Denmark",flag:"🇩🇰"},{code:"EE",name:"Estonia",flag:"🇪🇪"},
  {code:"FI",name:"Finland",flag:"🇫🇮"},{code:"FR",name:"France",flag:"🇫🇷"},
  {code:"DE",name:"Germany",flag:"🇩🇪"},{code:"GR",name:"Greece",flag:"🇬🇷"},
  {code:"HU",name:"Hungary",flag:"🇭🇺"},{code:"IE",name:"Ireland",flag:"🇮🇪"},
  {code:"IT",name:"Italy",flag:"🇮🇹"},{code:"LV",name:"Latvia",flag:"🇱🇻"},
  {code:"LT",name:"Lithuania",flag:"🇱🇹"},{code:"LU",name:"Luxembourg",flag:"🇱🇺"},
  {code:"MT",name:"Malta",flag:"🇲🇹"},{code:"NL",name:"Netherlands",flag:"🇳🇱"},
  {code:"PL",name:"Poland",flag:"🇵🇱"},{code:"PT",name:"Portugal",flag:"🇵🇹"},
  {code:"RO",name:"Romania",flag:"🇷🇴"},{code:"SK",name:"Slovakia",flag:"🇸🇰"},
  {code:"SI",name:"Slovenia",flag:"🇸🇮"},{code:"ES",name:"Spain",flag:"🇪🇸"},
  {code:"SE",name:"Sweden",flag:"🇸🇪"},{code:"GB",name:"United Kingdom",flag:"🇬🇧"},
  {code:"CH",name:"Switzerland",flag:"🇨🇭"},{code:"NO",name:"Norway",flag:"🇳🇴"},
  {code:"IS",name:"Iceland",flag:"🇮🇸"},{code:"RS",name:"Serbia",flag:"🇷🇸"},
  {code:"BA",name:"Bosnia & Herzegovina",flag:"🇧🇦"},{code:"ME",name:"Montenegro",flag:"🇲🇪"},
  {code:"MK",name:"North Macedonia",flag:"🇲🇰"},{code:"AL",name:"Albania",flag:"🇦🇱"},
  {code:"XK",name:"Kosovo",flag:"🇽🇰"},{code:"MD",name:"Moldova",flag:"🇲🇩"},
  {code:"UA",name:"Ukraine",flag:"🇺🇦"},{code:"BY",name:"Belarus",flag:"🇧🇾"},
  {code:"TR",name:"Turkey",flag:"🇹🇷"},{code:"AD",name:"Andorra",flag:"🇦🇩"},
  {code:"MC",name:"Monaco",flag:"🇲🇨"},{code:"SM",name:"San Marino",flag:"🇸🇲"},
  {code:"LI",name:"Liechtenstein",flag:"🇱🇮"},{code:"SA",name:"Saudi Arabia",flag:"🇸🇦"},
  {code:"AE",name:"UAE",flag:"🇦🇪"},{code:"CL",name:"Chile",flag:"🇨🇱"},
  {code:"BR",name:"Brazil",flag:"🇧🇷"},{code:"MA",name:"Morocco",flag:"🇲🇦"},
  {code:"KZ",name:"Kazakhstan",flag:"🇰🇿"},{code:"BH",name:"Bahrain",flag:"🇧🇭"},
].sort((a,b)=>a.name.localeCompare(b.name));

// Compute all holidays for a country in a given year
function getHolidays(cc, year) {
  const hols = {};
  const key = (m,d) => `${year}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

  // Fixed holidays
  (FIXED[cc]||[]).forEach(([m,d,n])=>{ hols[key(m,d)]=n; });

  // Easter-based
  const eRules = EASTER_RULES[cc]||[];
  if (eRules.length) {
    const easter = ORTHODOX_COUNTRIES.has(cc) ? easterOrthodox(year) : easterWestern(year);
    eRules.forEach(([off,n])=>{
      const d=new Date(easter);d.setDate(d.getDate()+off);
      hols[key(d.getMonth()+1,d.getDate())]=n;
    });
  }

  // Orthodox Easter for countries that have it as a holiday
  if (ORTHODOX_COUNTRIES.has(cc)) {
    const oe = easterOrthodox(year);
    const gf = new Date(oe); gf.setDate(gf.getDate()-2);
    const em = new Date(oe); em.setDate(em.getDate()+1);
    hols[key(gf.getMonth()+1,gf.getDate())]="Good Friday";
    hols[key(oe.getMonth()+1,oe.getDate())]="Easter";
    hols[key(em.getMonth()+1,em.getDate())]="Easter Monday";
  }

  // Islamic holidays
  if (ISLAMIC_BASE_2026[cc]) {
    islamicHolidays(year, ISLAMIC_BASE_2026[cc]).forEach(({m,d,name})=>{
      hols[key(m,d)]=name;
    });
  }

  return hols;
}

// ─── UTILITY FUNCTIONS ────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2,10);
const pad2 = n => String(n).padStart(2,"0");

function getDaysInMonth(y,m) { return new Date(y,m+1,0).getDate(); }
function getFirstDayOfMonth(y,m) { return (new Date(y,m,1).getDay()+6)%7; } // 0=Mon

function parseTime(t) {
  const [h,m] = t.split(":").map(Number);
  return h*60+m;
}

function shiftDuration(start,end) {
  let s=parseTime(start), e=parseTime(end);
  if(e<=s) e+=24*60; // overnight
  return (e-s)/60;
}

function formatHours(h) { return h%1===0 ? h.toString() : h.toFixed(1); }

// ─── STORAGE LAYER ────────────────────────────────────────────
const db = {
  get(k) { try { return JSON.parse(localStorage.getItem("wsl_"+k)) } catch { return null } },
  set(k,v) { try { localStorage.setItem("wsl_"+k,JSON.stringify(v)) } catch {} },
  del(k) { try { localStorage.removeItem("wsl_"+k) } catch {} },
};
const api = {
  async loadCompany(id, pin) { try { const r=await fetch(`/api/company?id=${id}&pin=${encodeURIComponent(pin)}`);const j=await r.json();return j.ok?j.company:null } catch { return null } },
  async loadMember(id, memberId) { try { const r=await fetch(`/api/company?id=${id}&member=${memberId}`);const j=await r.json();return j.ok?j.company:null } catch { return null } },
  async createCompany(c) { try { const{id,pin,...d}=c;await fetch("/api/company",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,pin,...d})}) } catch {} },
  async updateCompany(c) { try { const{id,pin,...d}=c;await fetch("/api/company",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,pin,...d})}) } catch {} },
};

// ─── ICONS (SVG inline) ───────────────────────────────────────
const Icons = {
  Calendar:({s=20,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Users:({s=20,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Clock:({s=20,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Plus:({s=20,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  X:({s=20,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check:({s=20,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Share:({s=20,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  Copy:({s=20,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  ChevLeft:({s=20,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevRight:({s=20,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Trash:({s=20,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Edit:({s=20,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Settings:({s=20,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Sun:({s=20,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  Moon:({s=20,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Download:({s=20,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Building:({s=20,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><path d="M9 18h6"/></svg>,
  Alert:({s=20,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12" y2="17.01"/></svg>,
  CopyFwd:({s=20,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/><polyline points="16 13 19 16 16 19"/></svg>,
  Printer:({s=20,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  QR:({s=20,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><rect x="14" y="14" width="4" height="4"/><line x1="22" y1="14" x2="22" y2="14.01"/><line x1="14" y1="22" x2="14" y2="22.01"/><line x1="22" y1="22" x2="22" y2="22.01"/><line x1="18" y1="18" x2="22" y2="18"/><line x1="18" y1="22" x2="18" y2="22.01"/></svg>,
  Home:({s=20,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Layers:({s=20,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  Link:({s=20,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
};

// ─── GLASS BUTTON COMPONENT ──────────────────────────────────
function GBtn({children,onClick,primary,danger,small,disabled,th,style:sx,...rest}){
  const [hov,setHov]=useState(false);
  const bg=danger?(hov?th.er:th.erBg):primary?(hov?th.acG:th.acG):(hov?th.gbh:th.gbg);
  const co=danger?"#fff":primary?"#fff":th.tx;
  const bd=danger?`1px solid ${th.er}`:primary?"none":`1px solid ${th.gbd}`;
  const sh=primary?(hov?th.acSh:"0 2px 8px rgba(0,0,0,0.06)"):"0 2px 8px rgba(0,0,0,0.04)";
  return <button
    onClick={disabled?undefined:onClick}
    onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
    style={{
      padding:small?"6px 12px":"10px 20px",borderRadius:G.rXs,border:bd,
      background:bg,color:co,fontSize:small?12:14,fontWeight:600,fontFamily:F,
      cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.5:1,
      backdropFilter:primary?undefined:G.blurS,WebkitBackdropFilter:primary?undefined:G.blurS,
      boxShadow:sh,transition:"all 0.2s ease",display:"inline-flex",alignItems:"center",gap:6,
      ...sx
    }}
    {...rest}
  >{children}</button>;
}

// ─── GLASS INPUT COMPONENT ───────────────────────────────────
function GInput({th,style:sx,...rest}){
  return <input style={{
    padding:"10px 14px",borderRadius:G.rXs,border:`1px solid ${th.inputBd}`,
    background:th.inputBg,color:th.tx,fontSize:14,fontFamily:F,
    backdropFilter:G.blurS,WebkitBackdropFilter:G.blurS,
    outline:"none",width:"100%",transition:"border 0.2s",
    ...sx
  }} {...rest}/>;
}

// ─── GLASS SELECT COMPONENT ──────────────────────────────────
function GSelect({th,children,style:sx,...rest}){
  return <select style={{
    padding:"10px 14px",borderRadius:G.rXs,border:`1px solid ${th.inputBd}`,
    background:th.inputBg,color:th.tx,fontSize:14,fontFamily:F,
    outline:"none",width:"100%",cursor:"pointer",
    ...sx
  }} {...rest}>{children}</select>;
}

// ─── GLASS CARD COMPONENT ────────────────────────────────────
function GCard({th,children,style:sx,...rest}){
  return <div style={{
    borderRadius:G.r,border:`1px solid ${th.gbd}`,
    background:th.card,boxShadow:th.cardS,
    backdropFilter:G.blur,WebkitBackdropFilter:G.blur,
    ...sx
  }} {...rest}>{children}</div>;
}

// ─── THEME SWITCHER ──────────────────────────────────────────
function ThemeSwitcher({theme,setTheme,th}){
  return <div style={{display:"flex",gap:4,background:th.gbg,borderRadius:G.rXs,padding:3,border:`1px solid ${th.bd}`}}>
    {Object.values(TH).map(t=><button key={t.id} onClick={()=>setTheme(t.id)}
      style={{
        padding:"4px 10px",borderRadius:G.rXs-2,border:"none",cursor:"pointer",
        background:theme===t.id?th.ac+"20":"transparent",
        color:theme===t.id?th.ac:th.t3,fontSize:13,fontFamily:F,fontWeight:600,
        transition:"all 0.2s"
      }}>{t.ic}</button>)}
  </div>;
}

// ─── LANGUAGE SWITCHER ───────────────────────────────────────
function LangSwitcher({lang,setLang,th}){
  return <GSelect th={th} value={lang} onChange={e=>setLang(e.target.value)}
    style={{width:"auto",padding:"4px 8px",fontSize:12,fontWeight:600}}>
    <option value="en">🇬🇧 EN</option>
    <option value="ro">🇷🇴 RO</option>
  </GSelect>;
}

// ─── MODAL COMPONENT ─────────────────────────────────────────
function Modal({open,onClose,title,children,th,wide}){
  if(!open)return null;
  return <div style={{
    position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",
    background:"rgba(0,0,0,0.4)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",
    padding:16,
  }} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{
      width:"100%",maxWidth:wide?640:440,maxHeight:"85vh",overflow:"auto",
      borderRadius:G.rL,border:`1px solid ${th.gbd}`,background:th.card,
      boxShadow:"0 24px 80px rgba(0,0,0,0.15)",backdropFilter:G.blur,WebkitBackdropFilter:G.blur,
      padding:28,
    }}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h2 style={{fontSize:20,fontWeight:800,color:th.tx,fontFamily:F,margin:0}}>{title}</h2>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",padding:4}}>
          <Icons.X s={20} c={th.t3}/>
        </button>
      </div>
      {children}
    </div>
  </div>;
}

// ─── TOAST COMPONENT ─────────────────────────────────────────
function Toast({msg,type="ok",th}){
  if(!msg)return null;
  const bg=type==="ok"?th.okBg:type==="warn"?th.warnBg:th.erBg;
  const co=type==="ok"?th.ok:type==="warn"?th.warn:th.er;
  return <div style={{
    position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",zIndex:2000,
    padding:"10px 24px",borderRadius:G.r,background:bg,border:`1px solid ${co}30`,
    color:co,fontSize:14,fontWeight:600,fontFamily:F,
    backdropFilter:G.blur,WebkitBackdropFilter:G.blur,
    boxShadow:"0 8px 32px rgba(0,0,0,0.12)",
    animation:"slideUp 0.3s ease",
  }}>{msg}</div>;
}

// ─── LANDING PAGE
// ─── LANDING PAGE ─────────────────────────────────────────────
function Landing({onCreateCompany,onAccessCompany,onDeleteCompany,recentCompanies,th,t,lang,setLang,theme,setTheme}){
  const [showCreate,setShowCreate]=useState(false);
  const [showAccess,setShowAccess]=useState(false);
  const [companyName,setCompanyName]=useState("");
  const [country]=useState("RO");
  const [pin,setPin]=useState("");
  const [accessCode,setAccessCode]=useState("");
  const [accessPin,setAccessPin]=useState("");
  const [opDays,setOpDays]=useState({
    mon:{active:true,start:"09:00",end:"17:00"},
    tue:{active:true,start:"09:00",end:"17:00"},
    wed:{active:true,start:"09:00",end:"17:00"},
    thu:{active:true,start:"09:00",end:"17:00"},
    fri:{active:true,start:"09:00",end:"17:00"},
    sat:{active:false,start:"10:00",end:"14:00"},
    sun:{active:false,start:"10:00",end:"14:00"},
  });

  const toggleDay=(day)=>setOpDays(prev=>({...prev,[day]:{...prev[day],active:!prev[day].active}}));
  const setDayTime=(day,field,val)=>setOpDays(prev=>({...prev,[day]:{...prev[day],[field]:val}}));
  const applyPreset=(preset)=>{
    if(preset==="monFri") setOpDays({
    mon:{active:true,start:"09:00",end:"17:00"},
    tue:{active:true,start:"09:00",end:"17:00"},
    wed:{active:true,start:"09:00",end:"17:00"},
    thu:{active:true,start:"09:00",end:"17:00"},
    fri:{active:true,start:"09:00",end:"17:00"},
    sat:{active:false,start:"10:00",end:"14:00"},
    sun:{active:false,start:"10:00",end:"14:00"},
  });
    else setOpDays(prev=>{const n={...prev};Object.keys(n).forEach(d=>{n[d]={...n[d],active:true}});return n;});
  };

  const handleCreate=()=>{
    if(!companyName.trim()||!pin.trim())return;
    const company={
      id:uid(),name:companyName.trim(),country,opDays,pin,
      employees:[],shifts:[],leaves:[...DEFAULT_LEAVES],assignments:{},leaveAssignments:{},createdAt:Date.now(),
    };
    onCreateCompany(company);
  };

  const handleAccess=()=>{
    if(!accessCode.trim()||!accessPin.trim())return;
    onAccessCompany(accessCode.trim(),accessPin.trim());
  };

  const [confirmDeleteId,setConfirmDeleteId]=useState(null);
  const [pinPromptId,setPinPromptId]=useState(null);
  const [pinInput,setPinInput]=useState("");

  return <div style={{minHeight:"100vh",background:th.bg,fontFamily:F,padding:0}}>
    {/* Header */}
    <header style={{
      padding:"12px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",
      background:th.hdr,backdropFilter:G.blur,WebkitBackdropFilter:G.blur,
      borderBottom:`1px solid ${th.bd}`,position:"sticky",top:0,zIndex:100,
    }}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:36,height:36,borderRadius:G.rXs,background:th.acG,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Icons.Calendar s={18} c="#fff"/>
        </div>
        <span style={{fontSize:18,fontWeight:800,color:th.tx,letterSpacing:"-0.02em"}}>{t.appName}</span>
      </div>
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        <div style={{display:"inline-flex",borderRadius:10,overflow:"hidden",border:`1px solid ${th.bd}`}}>
          <button onClick={()=>setLang("ro")} style={{
            padding:"5px 10px",border:"none",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:F,
            background:lang==="ro"?th.ac:"transparent",color:lang==="ro"?"#fff":th.t3,transition:"all 0.15s",
          }}>🇷🇴 RO</button>
          <button onClick={()=>setLang("en")} style={{
            padding:"5px 10px",border:"none",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:F,
            background:lang==="en"?th.ac:"transparent",color:lang==="en"?"#fff":th.t3,transition:"all 0.15s",
          }}>🇬🇧 EN</button>
        </div>
        <ThemeSwitcher theme={theme} setTheme={setTheme} th={th}/>
      </div>
    </header>

    <div style={{maxWidth:540,margin:"0 auto",padding:"40px 24px 40px"}}>

      {/* ── CTA: Create Company ── */}
      <div onClick={()=>setShowCreate(true)} style={{
        cursor:"pointer",padding:"20px 24px",borderRadius:G.rL,marginBottom:14,
        background:"linear-gradient(135deg,#3b6de6 0%,#5b9aff 50%,#93c5fd 100%)",
        boxShadow:"0 8px 32px rgba(59,109,230,0.25)",
        display:"flex",alignItems:"center",gap:16,transition:"transform 0.15s,box-shadow 0.15s",
        position:"relative",overflow:"hidden",
      }}>
        <div style={{width:48,height:48,borderRadius:16,background:"rgba(255,255,255,0.2)",
          backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",
          display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <Icons.Plus s={24} c="#fff"/>
        </div>
        <div>
          <div style={{fontSize:18,fontWeight:800,color:"#fff"}}>{t.createCompany}</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.8)",marginTop:2}}>{t.tagline}</div>
        </div>
        {/* Decorative blur blob */}
        <div style={{position:"absolute",right:40,top:-10,width:100,height:100,borderRadius:50,
          background:"rgba(255,255,255,0.15)",filter:"blur(20px)"}}/>
      </div>

      {/* ── CTA: Access Company ── */}
      <div onClick={()=>setShowAccess(true)} style={{
        cursor:"pointer",padding:"16px 24px",borderRadius:G.rL,marginBottom:32,
        background:"linear-gradient(135deg,#059669 0%,#34d399 50%,#6ee7b7 100%)",
        boxShadow:"0 6px 24px rgba(5,150,105,0.2)",
        display:"flex",alignItems:"center",gap:16,transition:"transform 0.15s",
        position:"relative",overflow:"hidden",
      }}>
        <div style={{width:44,height:44,borderRadius:14,background:"rgba(255,255,255,0.2)",
          backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",
          display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <Icons.Link s={20} c="#fff"/>
        </div>
        <div>
          <div style={{fontSize:16,fontWeight:800,color:"#fff"}}>{t.joinCompany}</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.8)",marginTop:1}}>{t.enterCode}</div>
        </div>
      </div>

      {/* ── Schedule Mockup Preview ── */}
      <div style={{
        borderRadius:G.rL,background:th.card,border:`1px solid ${th.gbd}`,
        boxShadow:th.cardS,backdropFilter:G.blur,WebkitBackdropFilter:G.blur,
        padding:16,marginBottom:24,overflow:"hidden",
      }}>
        <div style={{textAlign:"center",marginBottom:10}}>
          <div style={{fontSize:13,fontWeight:800,color:th.tx}}>
            {lang==="ro"?"Aprilie 2026":"April 2026"}
          </div>
          <div style={{fontSize:9,color:th.t3,marginTop:2}}>
            {lang==="ro"?"Exemplu de program completat":"Sample filled schedule"}
          </div>
        </div>
        {(()=>{
          const mockRO=[
            {n:"Maria P.",r:"BARISTA",c:"#3b6de6",shifts:[{d:1,s:"Dimineață",sc:"#3b6de6"},{d:2,s:"Dimineață",sc:"#3b6de6"},{d:3,l:"CO"},{d:4,s:"Seara",sc:"#059669"},{d:5,s:"Seara",sc:"#059669"}]},
            {n:"Ion D.",r:"BARISTA",c:"#f97316",shifts:[{d:1,s:"Seara",sc:"#059669"},{d:2,l:"CM"},{d:3,s:"Dimineață",sc:"#3b6de6"},{d:4,s:"Dimineață",sc:"#3b6de6"},{d:7,s:"Noapte",sc:"#7c3aed"}]},
            {n:"Ana V.",r:"SERVER",c:"#ec4899",shifts:[{d:1,s:"Noapte",sc:"#7c3aed"},{d:2,s:"Seara",sc:"#059669"},{d:3,s:"Seara",sc:"#059669"},{d:5,s:"Dimineață",sc:"#3b6de6"},{d:6,s:"Dimineață",sc:"#3b6de6"}]},
            {n:"Gheo M.",r:"SERVER",c:"#10b981",shifts:[{d:2,s:"Dimineață",sc:"#3b6de6"},{d:3,s:"Noapte",sc:"#7c3aed"},{d:4,s:"Noapte",sc:"#7c3aed"},{d:5,s:"Seara",sc:"#059669"},{d:6,s:"Seara",sc:"#059669"}]},
          ];
          const mockEN=[
            {n:"Maria P.",r:"BARISTA",c:"#3b6de6",shifts:[{d:1,s:"Morning",sc:"#3b6de6"},{d:2,s:"Morning",sc:"#3b6de6"},{d:3,l:"PTO"},{d:4,s:"Evening",sc:"#059669"},{d:5,s:"Evening",sc:"#059669"}]},
            {n:"Ion D.",r:"BARISTA",c:"#f97316",shifts:[{d:1,s:"Evening",sc:"#059669"},{d:2,l:"Sick"},{d:3,s:"Morning",sc:"#3b6de6"},{d:4,s:"Morning",sc:"#3b6de6"},{d:7,s:"Night",sc:"#7c3aed"}]},
            {n:"Ana V.",r:"SERVER",c:"#ec4899",shifts:[{d:1,s:"Night",sc:"#7c3aed"},{d:2,s:"Evening",sc:"#059669"},{d:3,s:"Evening",sc:"#059669"},{d:5,s:"Morning",sc:"#3b6de6"},{d:6,s:"Morning",sc:"#3b6de6"}]},
            {n:"Gheo M.",r:"SERVER",c:"#10b981",shifts:[{d:2,s:"Morning",sc:"#3b6de6"},{d:3,s:"Night",sc:"#7c3aed"},{d:4,s:"Night",sc:"#7c3aed"},{d:5,s:"Evening",sc:"#059669"},{d:6,s:"Evening",sc:"#059669"}]},
          ];
          const mock=lang==="ro"?mockRO:mockEN;
          const dayNames=lang==="ro"?["L","M","M","J","V","S","D"]:["M","T","W","T","F","S","S"];
          const holDay=lang==="ro"?"Paște":"Easter";
          return <div style={{overflowX:"auto"}}>
            <div style={{minWidth:380}}>
              {/* Day header */}
              <div style={{display:"grid",gridTemplateColumns:"80px repeat(7,1fr)",gap:1,marginBottom:2}}>
                <div style={{fontSize:8,color:th.t3,padding:"2px 4px"}}>{lang==="ro"?"Angajați":"Employees"}</div>
                {[1,2,3,4,5,6,7].map(d=><div key={d} style={{
                  fontSize:8,fontWeight:600,textAlign:"center",padding:"2px 0",
                  color:d>=6?th.holTx:th.t3,
                }}>{dayNames[d-1]} {d}</div>)}
              </div>
              {/* Employee rows */}
              {(()=>{
                let lastRole="";
                return mock.map((emp,idx)=>{
                  const showRole=emp.r!==lastRole;
                  lastRole=emp.r;
                  return <Fragment key={idx}>
                    {showRole&&<div style={{
                      fontSize:7,fontWeight:800,color:th.ac,textTransform:"uppercase",
                      padding:"3px 4px",background:th.acS,borderRadius:4,marginBottom:1,marginTop:idx>0?4:0,
                      letterSpacing:"0.05em",
                    }}>{emp.r}</div>}
                    <div style={{display:"grid",gridTemplateColumns:"80px repeat(7,1fr)",gap:1,marginBottom:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:4,padding:"3px 4px"}}>
                        <div style={{width:16,height:16,borderRadius:6,background:`linear-gradient(135deg,${emp.c},${emp.c}88)`,
                          display:"flex",alignItems:"center",justifyContent:"center",
                          fontSize:7,fontWeight:700,color:"#fff",flexShrink:0}}>
                          {emp.n.charAt(0)}
                        </div>
                        <span style={{fontSize:9,fontWeight:600,color:th.tx,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{emp.n}</span>
                      </div>
                      {[1,2,3,4,5,6,7].map(d=>{
                        const shift=emp.shifts.find(s=>s.d===d);
                        const isWeekend=d>=6;
                        if(!shift) return <div key={d} style={{
                          borderRadius:4,minHeight:22,
                          background:isWeekend?th.holBg:"transparent",
                          border:`0.5px solid ${th.bd2}`,
                        }}/>;
                        if(shift.l) return <div key={d} style={{
                          borderRadius:4,minHeight:22,
                          background:shift.l==="CO"||shift.l==="PTO"?"rgba(34,197,94,0.12)":"rgba(239,68,68,0.1)",
                          border:`0.5px solid ${shift.l==="CO"||shift.l==="PTO"?"rgba(34,197,94,0.3)":"rgba(239,68,68,0.2)"}`,
                          display:"flex",alignItems:"center",justifyContent:"center",
                        }}>
                          <span style={{fontSize:7,fontWeight:700,fontStyle:"italic",
                            color:shift.l==="CO"||shift.l==="PTO"?"#059669":"#dc2626"}}>{shift.l}</span>
                        </div>;
                        return <div key={d} style={{
                          borderRadius:4,minHeight:22,background:shift.sc,
                          display:"flex",alignItems:"center",justifyContent:"center",
                        }}>
                          <span style={{fontSize:6,fontWeight:600,color:"#fff"}}>{shift.s}</span>
                        </div>;
                      })}
                    </div>
                  </Fragment>;
                });
              })()}
              {/* Legend */}
              <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:8,flexWrap:"wrap"}}>
                {[
                  {c:"#3b6de6",l:lang==="ro"?"Dimineață":"Morning"},
                  {c:"#059669",l:lang==="ro"?"Seara":"Evening"},
                  {c:"#7c3aed",l:lang==="ro"?"Noapte":"Night"},
                ].map(({c:co,l},i)=><span key={i} style={{display:"flex",alignItems:"center",gap:3,fontSize:8,color:th.t2}}>
                  <div style={{width:6,height:6,borderRadius:2,background:co}}/>{l}
                </span>)}
                <span style={{display:"flex",alignItems:"center",gap:3,fontSize:8,color:th.t2}}>
                  <div style={{width:6,height:6,borderRadius:2,background:"rgba(34,197,94,0.3)",border:"0.5px solid rgba(34,197,94,0.5)"}}/>{lang==="ro"?"Concediu":"Leave"}
                </span>
              </div>
            </div>
          </div>;
        })()}
      </div>

      {/* ── Recent Companies ── */}
      {recentCompanies.length>0 && <div>
        <h3 style={{fontSize:12,fontWeight:700,color:th.t3,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>{t.recentCompanies}</h3>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {recentCompanies.map(c=><GCard key={c.id} th={th} style={{
            padding:"12px 16px",display:"flex",alignItems:"center",gap:12,
          }}>
            <div style={{display:"flex",alignItems:"center",gap:10,flex:1,cursor:"pointer",minWidth:0}}
              onClick={()=>{setPinPromptId(pinPromptId===c.id?null:c.id);setPinInput("");}}>
              <span style={{fontSize:22}}>{COUNTRIES.find(x=>x.code===c.country)?.flag||"🏢"}</span>
              <div style={{minWidth:0,flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:th.tx,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                <div style={{fontSize:11,color:th.t3}}>{c.empCount||0} {t.employees.toLowerCase()}</div>
                {/* PIN input inline */}
                {pinPromptId===c.id&&<div style={{display:"flex",gap:4,marginTop:6,alignItems:"center"}} onClick={e=>e.stopPropagation()}>
                  <GInput th={th} type="password" value={pinInput} onChange={e=>setPinInput(e.target.value)}
                    placeholder={t.enterPin} style={{padding:"5px 8px",fontSize:11,flex:1}}
                    onKeyDown={e=>{if(e.key==="Enter"&&pinInput)onAccessCompany(c.id,pinInput)}}
                    autoFocus/>
                  <button onClick={()=>{if(pinInput)onAccessCompany(c.id,pinInput)}} style={{
                    padding:"5px 12px",borderRadius:6,border:"none",cursor:"pointer",
                    background:th.acG,color:"#fff",fontSize:10,fontWeight:700,fontFamily:F,
                  }}>{t.access}</button>
                </div>}
              </div>
            </div>
            <button onClick={()=>{setPinPromptId(pinPromptId===c.id?null:c.id);setPinInput("");}}
              style={{background:"none",border:"none",cursor:"pointer",padding:4,flexShrink:0}}>
              <Icons.ChevRight s={18} c={th.t3}/>
            </button>
            {confirmDeleteId===c.id?<div style={{display:"flex",gap:4,alignItems:"center",flexShrink:0}}>
              <button onClick={()=>{onDeleteCompany(c.id);setConfirmDeleteId(null)}}
                style={{background:th.er,color:"#fff",border:"none",borderRadius:6,padding:"4px 10px",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:F}}>
                Da
              </button>
              <button onClick={()=>setConfirmDeleteId(null)}
                style={{background:th.t3+"30",color:th.t2,border:"none",borderRadius:6,padding:"4px 8px",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:F}}>
                Nu
              </button>
            </div>:<button onClick={()=>setConfirmDeleteId(c.id)}
              style={{background:"none",border:"none",cursor:"pointer",padding:4,flexShrink:0}}>
              <Icons.X s={16} c={th.t3}/>
            </button>}
          </GCard>)}
        </div>
      </div>}

      {/* ── Features ── */}
      {recentCompanies.length===0&&<div style={{marginTop:20}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {[
            {ic:"👥",tx:t.f1},{ic:"🔄",tx:t.f2},{ic:"🇷🇴",tx:t.f3},
            {ic:"📋",tx:t.f4},{ic:"🔗",tx:t.f5},{ic:"🔓",tx:t.f6},
          ].map((f,i)=><GCard key={i} th={th} style={{padding:"14px 10px",textAlign:"center"}}>
            <div style={{fontSize:22,marginBottom:4}}>{f.ic}</div>
            <div style={{fontSize:10,fontWeight:600,color:th.t2}}>{f.tx}</div>
          </GCard>)}
        </div>
      </div>}
    </div>

    {/* Footer */}
    <div style={{textAlign:"center",padding:"24px",borderTop:`1px solid ${th.bd}`}}>
      <p style={{fontSize:12,color:th.t3,margin:0}}>{t.poweredBy}</p>
    </div>

    {/* CREATE MODAL */}
    <Modal open={showCreate} onClose={()=>setShowCreate(false)} title={t.createCompany} th={th} wide>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div>
          <label style={{fontSize:12,fontWeight:700,color:th.t2,display:"block",marginBottom:6}}>{t.companyName}</label>
          <GInput th={th} value={companyName} onChange={e=>setCompanyName(e.target.value)} placeholder="Acme Corp"/>
        </div>
        <div>
          <label style={{fontSize:12,fontWeight:700,color:th.t2,display:"block",marginBottom:6}}>{t.country}</label>
          <div style={{padding:"10px 14px",borderRadius:G.rXs,border:`1px solid ${th.inputBd}`,
            background:th.inputBg,fontSize:14,fontFamily:F,color:th.tx,display:"flex",alignItems:"center",gap:8}}>
            <span>🇷🇴</span> România
          </div>
        </div>

        {/* OPERATING DAYS & HOURS */}
        <div>
          <label style={{fontSize:12,fontWeight:700,color:th.t2,display:"block",marginBottom:6}}>{t.operatingDays}</label>
          {/* Quick presets */}
          <div style={{display:"flex",gap:6,marginBottom:10}}>
            <button onClick={()=>applyPreset("monFri")} style={{
              padding:"6px 12px",borderRadius:G.rXs,cursor:"pointer",fontFamily:F,fontSize:11,fontWeight:600,
              border:`1px solid ${th.inputBd}`,background:th.inputBg,color:th.t2,transition:"all 0.2s",
            }}>{t.monFri}</button>
            <button onClick={()=>applyPreset("allWeek")} style={{
              padding:"6px 12px",borderRadius:G.rXs,cursor:"pointer",fontFamily:F,fontSize:11,fontWeight:600,
              border:`1px solid ${th.inputBd}`,background:th.inputBg,color:th.t2,transition:"all 0.2s",
            }}>{t.allWeek}</button>
          </div>
          {/* Day rows */}
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            {["mon","tue","wed","thu","fri","sat","sun"].map(day=>{
              const dayLabels={mon:t.monFull,tue:t.tueFull,wed:t.wedFull,thu:t.thuFull,fri:t.friFull,sat:t.satFull||"Saturday",sun:t.sunFull||"Sunday"};
              const cfg=opDays[day];
              return <div key={day} style={{
                display:"flex",alignItems:"center",gap:8,padding:"6px 10px",
                borderRadius:G.rXs,border:`1px solid ${cfg.active?th.ac+"30":th.bd2}`,
                background:cfg.active?th.acS+"30":"transparent",transition:"all 0.15s",
              }}>
                {/* Toggle */}
                <button onClick={()=>toggleDay(day)} style={{
                  width:36,height:20,borderRadius:10,border:"none",cursor:"pointer",position:"relative",
                  background:cfg.active?th.ac:th.t3+"50",transition:"background 0.2s",flexShrink:0,
                }}>
                  <div style={{
                    width:16,height:16,borderRadius:8,background:"#fff",
                    position:"absolute",top:2,left:cfg.active?18:2,transition:"left 0.2s",
                    boxShadow:"0 1px 3px rgba(0,0,0,0.2)",
                  }}/>
                </button>
                {/* Day name */}
                <span style={{fontSize:12,fontWeight:700,color:cfg.active?th.tx:th.t3,
                  minWidth:80,transition:"color 0.2s"}}>{dayLabels[day]}</span>
                {/* Time inputs or Closed label */}
                {cfg.active ? <div style={{display:"flex",alignItems:"center",gap:4,flex:1}}>
                  <GInput th={th} type="time" value={cfg.start} onChange={e=>setDayTime(day,"start",e.target.value)}
                    style={{padding:"4px 6px",fontSize:11,width:"auto",flex:1,minWidth:0}}/>
                  <span style={{fontSize:11,color:th.t3}}>–</span>
                  <GInput th={th} type="time" value={cfg.end} onChange={e=>setDayTime(day,"end",e.target.value)}
                    style={{padding:"4px 6px",fontSize:11,width:"auto",flex:1,minWidth:0}}/>
                </div> : <span style={{fontSize:11,color:th.t3,fontStyle:"italic"}}>{t.closed}</span>}
              </div>;
            })}
          </div>
        </div>

        <div>
          <label style={{fontSize:12,fontWeight:700,color:th.t2,display:"block",marginBottom:6}}>{t.adminPin}</label>
          <GInput th={th} type="password" value={pin} onChange={e=>setPin(e.target.value)} placeholder="••••" maxLength={8}/>
          <span style={{fontSize:11,color:th.t3,marginTop:4,display:"block"}}>4-8 digits, only you need this</span>
        </div>
        <GBtn primary th={th} onClick={handleCreate} disabled={!companyName.trim()||!pin.trim()} style={{marginTop:8}}>
          <Icons.Check s={16} c="#fff"/> {t.create}
        </GBtn>
      </div>
    </Modal>

    {/* ACCESS MODAL */}
    <Modal open={showAccess} onClose={()=>setShowAccess(false)} title={t.joinCompany} th={th}>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div>
          <label style={{fontSize:12,fontWeight:700,color:th.t2,display:"block",marginBottom:6}}>{t.enterCode}</label>
          <GInput th={th} value={accessCode} onChange={e=>setAccessCode(e.target.value)} placeholder="Company code"/>
        </div>
        <div>
          <label style={{fontSize:12,fontWeight:700,color:th.t2,display:"block",marginBottom:6}}>{t.enterPin}</label>
          <GInput th={th} type="password" value={accessPin} onChange={e=>setAccessPin(e.target.value)} placeholder="••••"/>
        </div>
        <GBtn primary th={th} onClick={handleAccess} disabled={!accessCode.trim()||!accessPin.trim()}>
          <Icons.Check s={16} c="#fff"/> {t.access}
        </GBtn>
      </div>
    </Modal>
  </div>;
}

// ─── CALENDAR COMPONENT ──────────────────────────────────────
function ScheduleCalendar({company,month,year,selectedShift,selectedEmp,selectedLeave,onAssign,onRemove,onAssignLeave,onRemoveLeave,isAdmin,filterEmpId,th,t}){
  const days=getDaysInMonth(year,month);
  const firstDay=getFirstDayOfMonth(year,month);
  const holidays=useMemo(()=>getHolidays(company.country,year),[company.country,year]);
  const today=new Date();
  const isToday=(d)=>today.getFullYear()===year&&today.getMonth()===month&&today.getDate()===d;
  const dayKeys=["mon","tue","wed","thu","fri","sat","sun"];
  const opDays=company.opDays||{
    mon:{active:true},tue:{active:true},wed:{active:true},thu:{active:true},fri:{active:true},
    sat:{active:false},sun:{active:false},
  };
  const dayNamesShort=[t.mon,t.tue,t.wed,t.thu,t.fri,t.sat,t.sun];

  const dayCols=[];
  for(let d=1;d<=days;d++){
    const date=`${year}-${pad2(month+1)}-${pad2(d)}`;
    const dow=(firstDay+d-1)%7;
    const isClosedDay=!opDays[dayKeys[dow]]?.active;
    const hol=holidays[date];
    const isNonWorking=isClosedDay||!!hol;
    dayCols.push({d,date,dow,isClosedDay,hol,isNonWorking});
  }

  const grouped=useMemo(()=>{
    const emps=filterEmpId?company.employees.filter(e=>e.id===filterEmpId):[...company.employees];
    const sorted=emps.sort((a,b)=>(a.role||"zzz").toUpperCase().localeCompare((b.role||"zzz").toUpperCase()));
    const roles={};
    sorted.forEach(emp=>{
      const role=(emp.role||"General").toUpperCase();
      if(!roles[role])roles[role]=[];
      roles[role].push(emp);
    });
    return Object.entries(roles).sort(([a],[b])=>a.localeCompare(b));
  },[company.employees,filterEmpId]);

  const isEmpActiveOnDate=(empId,date)=>{
    const emp=company.employees.find(e=>e.id===empId);
    if(!emp)return false;
    if(emp.startDate&&date<emp.startDate)return false;
    if(emp.endDate&&date>emp.endDate)return false;
    return true;
  };

  const handleCellClick=(date,empId)=>{
    if(!isAdmin)return;
    if(!isEmpActiveOnDate(empId,date))return;
    if(selectedLeave&&(selectedEmp===empId||!selectedEmp)){
      onAssignLeave(date,empId,selectedLeave);
    } else if(selectedShift&&(selectedEmp===empId||!selectedEmp)){
      onAssign(date,empId,selectedShift);
    }
  };

  const handleRightClick=(e,date,empId)=>{
    e.preventDefault();
    if(!isAdmin)return;
    const la=(company.leaveAssignments||{})[date]||{};
    if(la[empId]){onRemoveLeave(date,empId);return;}
    const dayA=company.assignments[date]||{};
    if(dayA[empId])onRemove(date,empId);
  };

  const empTotalHours=(empId)=>{
    let total=0;
    dayCols.forEach(({date})=>{
      const dayA=company.assignments[date]||{};
      if(dayA[empId]){
        const ids=Array.isArray(dayA[empId])?dayA[empId]:[dayA[empId]];
        ids.forEach(sid=>{
          const sh=company.shifts.find(s=>s.id===sid);
          if(sh) total+=shiftDuration(sh.start,sh.end);
        });
      }
    });
    return total;
  };

  const colW=`minmax(80px,1fr)`;
  const gridCols=`180px repeat(${days},${colW}) 56px`;

  return <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
    <div style={{minWidth:days*82+240}}>
      {/* ── HEADER ROW ── */}
      <div style={{display:"grid",gridTemplateColumns:gridCols,gap:0,
        position:"sticky",top:0,zIndex:10,background:th.card,
        borderBottom:`2px solid ${th.bd}`,
      }}>
        <div style={{padding:"8px 12px",fontSize:11,fontWeight:700,color:th.t3,
          position:"sticky",left:0,zIndex:15,background:th.card,
          display:"flex",alignItems:"center",
        }}>
          {t.employees}
        </div>
        {dayCols.map(({d,dow,isNonWorking,hol})=>{
          const isTodayH=isToday(d);
          const isWeekend=dow>=5;
          const isSunday=dow===6;
          return <div key={d} style={{
            padding:"4px 6px",textAlign:"center",
            background:isTodayH?th.ac+"10":(isNonWorking?th.holBg+"60":(isWeekend?th.t3+"06":"transparent")),
            borderBottom:isTodayH?`3px solid ${th.ac}`:"none",
            borderRight:isSunday?`2px solid ${th.bd}`:`1px dotted ${th.bd2}`,
          }}>
            <div style={{fontSize:10,fontWeight:500,color:isNonWorking?th.holTx:th.t3}}>{dayNamesShort[dow]}</div>
            <div style={{fontSize:14,fontWeight:700,color:isTodayH?th.ac:(isNonWorking?th.holTx:th.tx)}}>{d}</div>
            {hol&&<div style={{fontSize:6,color:th.holTx,lineHeight:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{hol}</div>}
          </div>;
        })}
        <div style={{padding:"8px 4px",textAlign:"center",fontSize:10,fontWeight:700,color:th.t3}}>
          Total
        </div>
      </div>

      {/* ── EMPLOYEE ROWS ── */}
      {grouped.map(([role,emps])=><div key={role}>
        {grouped.length>1&&<div style={{
          padding:"6px 12px",
          background:th.acS,borderBottom:`1px solid ${th.bd}`,borderTop:`1px solid ${th.bd}`,
          fontSize:11,fontWeight:800,color:th.ac,textTransform:"uppercase",letterSpacing:"0.06em",
          minWidth:days*82+240,
        }}>
          {role}
        </div>}

        {emps.map(emp=>{
          const isEmpSel=selectedEmp===emp.id;
          const totalH=empTotalHours(emp.id);
          const isTerm=emp.status==="terminated";

          return <div key={emp.id} style={{
            display:"grid",gridTemplateColumns:gridCols,gap:0,
            background:isEmpSel?th.ac+"06":"transparent",
            borderBottom:`1px solid ${th.bd2}`,
            transition:"background 0.15s",
            minHeight:56,
          }}>
            {/* Employee name cell — sticky */}
            <div style={{
              padding:"8px 12px",display:"flex",alignItems:"center",gap:8,
              borderRight:`1px solid ${th.bd}`,
              position:"sticky",left:0,zIndex:5,
              background:isEmpSel?th.acS:th.card,
              cursor:"pointer",opacity:isTerm?0.4:1,
            }} onClick={()=>{if(isAdmin){}}}>
              <div style={{
                width:28,height:28,borderRadius:14,flexShrink:0,
                background:isTerm?th.t3+"40":(isEmpSel?th.acG:`linear-gradient(135deg,${th.t3}80,${th.t2}80)`),
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:11,fontWeight:700,color:"#fff",
              }}>{emp.name.charAt(0).toUpperCase()}</div>
              <div style={{minWidth:0,flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:isTerm?th.t3:th.tx,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
                  textDecoration:isTerm?"line-through":"none"}}>{emp.name}</div>
                <div style={{fontSize:10,color:totalH>0?th.ac:th.t3,fontWeight:600,marginTop:1}}>{formatHours(totalH)}h</div>
              </div>
            </div>

            {/* Day cells */}
            {dayCols.map(({d,date,dow,isNonWorking,hol})=>{
              const dayA=company.assignments[date]||{};
              const raw=dayA[emp.id];
              const shiftIds=raw?(Array.isArray(raw)?raw:[raw]):[];
              const shifts=shiftIds.map(id=>company.shifts.find(s=>s.id===id)).filter(Boolean);
              const la=(company.leaveAssignments||{})[date]||{};
              const leaveId=la[emp.id];
              const leave=leaveId?(company.leaves||[]).find(l=>l.id===leaveId):null;
              const empActive=isEmpActiveOnDate(emp.id,date);
              const canClick=isAdmin&&empActive&&(selectedShift||selectedLeave)&&(selectedEmp===emp.id||!selectedEmp);
              const isTodayCol=isToday(d);
              const isWeekend=dow>=5;
              const isSunday=dow===6;

              return <div key={d}
                onClick={()=>empActive&&handleCellClick(date,emp.id)}
                onContextMenu={e=>empActive?handleRightClick(e,date,emp.id):e.preventDefault()}
                style={{
                  padding:"4px 3px",
                  borderRight:isSunday?`2px solid ${th.bd}`:`1px dotted ${th.bd2}`,
                  background:!empActive?th.t3+"08":(isTodayCol?th.ac+"06":(isWeekend&&!isNonWorking?th.t3+"04":(isNonWorking?th.holBg+"40":"transparent"))),
                  cursor:canClick?"pointer":"default",
                  display:"flex",flexDirection:"column",alignItems:"stretch",justifyContent:"center",
                  gap:2,minHeight:56,transition:"background 0.1s",
                  opacity:empActive?1:0.25,
                  pointerEvents:empActive?"auto":"none",
                }}>
                {!empActive&&<div style={{fontSize:8,color:th.t3,textAlign:"center"}}>—</div>}
                {/* Shift cards — Agendrix style */}
                {shifts.map((sh,i)=><div key={sh.id+i} style={{
                  padding:"3px 5px",borderRadius:4,
                  background:sh.color+"12",
                  borderLeft:`3px solid ${sh.color}`,
                  fontSize:8,lineHeight:1.3,
                }}>
                  <div style={{fontWeight:700,color:th.tx}}>{sh.start}-{sh.end}</div>
                  <div style={{color:th.t3,fontSize:7,marginTop:1}}>{sh.name}</div>
                </div>)}
                {/* Leave badge */}
                {leave&&<div style={{
                  padding:"3px 5px",borderRadius:4,
                  background:leave.color+"15",borderLeft:`3px solid ${leave.color}`,
                  fontSize:8,fontWeight:700,color:leave.color,fontStyle:"italic",
                }}>{leave.short}</div>}
              </div>;
            })}

            {/* Total hours */}
            <div style={{
              padding:"8px 4px",textAlign:"center",borderLeft:`1px solid ${th.bd}`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontWeight:800,fontSize:13,
              color:totalH>0?th.ac:th.t3,
            }}>
              {totalH>0?formatHours(totalH)+"h":"–"}
            </div>
          </div>;
        })}
      </div>)}

      {company.employees.length===0&&<div style={{
        padding:"40px 20px",textAlign:"center",color:th.t3,fontSize:13,
      }}>{t.noEmployees}</div>}
    </div>
  </div>;
}


// ─── WORKSPACE (ADMIN VIEW) ──────────────────────────────────
function Workspace({company,onUpdate,onGoHome,th,t,lang,setLang,theme,setTheme}){
  const [selShift,setSelShift]=useState(null);
  const [selEmp,setSelEmp]=useState(null);
  const [curMonth,setCurMonth]=useState(new Date().getMonth());
  const [curYear,setCurYear]=useState(new Date().getFullYear());
  const [showAddEmp,setShowAddEmp]=useState(false);
  const [showAddShift,setShowAddShift]=useState(false);
  const [showShare,setShowShare]=useState(false);
  const [showAdminSettings,setShowAdminSettings]=useState(false);
  const [showLeaveLegend,setShowLeaveLegend]=useState(false);
  const [shiftsOpen,setShiftsOpen]=useState(true);
  const [leavesOpen,setLeavesOpen]=useState(true);
  const [otherLeavesOpen,setOtherLeavesOpen]=useState(false);
  const [editCompanyName,setEditCompanyName]=useState("");
  const [editCompanyCountry,setEditCompanyCountry]=useState("");
  const [editOpDays,setEditOpDays]=useState({});
  const [showAddLeave,setShowAddLeave]=useState(false);
  const [selLeave,setSelLeave]=useState(null);
  const [newLeaveName,setNewLeaveName]=useState("");
  const [newLeaveShort,setNewLeaveShort]=useState("");
  const [toast,setToast]=useState(null);
  const [editingShift,setEditingShift]=useState(null);
  const [editingEmp,setEditingEmp]=useState(null);
  const [showEditEmp,setShowEditEmp]=useState(false);
  const [editEmpName,setEditEmpName]=useState("");
  const [editEmpRole,setEditEmpRole]=useState("");
  const [editEmpHours,setEditEmpHours]=useState(8);
  const [editEmpPTO,setEditEmpPTO]=useState("");
  const [editEmpStartDate,setEditEmpStartDate]=useState("");
  const [editEmpEndDate,setEditEmpEndDate]=useState("");
  const [showTerminate,setShowTerminate]=useState(false);
  const [terminateDate,setTerminateDate]=useState("");
    const [copied,setCopied]=useState(false);

  // New emp/shift form state
  const [newEmpName,setNewEmpName]=useState("");
  const [newEmpRole,setNewEmpRole]=useState("");
  const [newEmpHours,setNewEmpHours]=useState(8);
  const [newEmpPTO,setNewEmpPTO]=useState("");
  const [newEmpStartDate,setNewEmpStartDate]=useState("");
  const [newShiftName,setNewShiftName]=useState("");
  const [newShiftStart,setNewShiftStart]=useState("09:00");
  const [newShiftEnd,setNewShiftEnd]=useState("17:00");
  const [dragIdx,setDragIdx]=useState(null);
  const [dragOverIdx,setDragOverIdx]=useState(null);

  const showToast=(msg,type="ok")=>{setToast({msg,type});setTimeout(()=>setToast(null),2500)};

  const handleShiftReorder=(fromIdx,toIdx)=>{
    if(fromIdx===null||toIdx===null||fromIdx===toIdx)return;
    const shifts=[...company.shifts];
    const [moved]=shifts.splice(fromIdx,1);
    shifts.splice(toIdx,0,moved);
    onUpdate({...company,shifts});
  };

  // Nav limits: current month to +3
  const now=new Date();
  const maxDate=new Date(now.getFullYear(),now.getMonth()+MAX_MONTHS_AHEAD,1);
  const minDate=new Date(2026,0,1); // Allow back to Jan 2026

  const canPrev=()=>{
    return new Date(curYear,curMonth,1)>minDate;
  };
  const canNext=()=>{
    const next=new Date(curYear,curMonth+1,1);
    return next<=maxDate;
  };
  const goPrev=()=>{if(canPrev()){if(curMonth===0){setCurMonth(11);setCurYear(curYear-1)}else setCurMonth(curMonth-1)}};
  const goNext=()=>{if(canNext()){if(curMonth===11){setCurMonth(0);setCurYear(curYear+1)}else setCurMonth(curMonth+1)}};

  const assign=(date,empId,shiftId)=>{
    const a={...company.assignments};
    if(!a[date])a[date]={};
    const cur=Array.isArray(a[date][empId])?[...a[date][empId]]:a[date][empId]?[a[date][empId]]:[];
    if(cur.includes(shiftId)){
      // Toggle off — remove this shift from the array
      const filtered=cur.filter(s=>s!==shiftId);
      if(filtered.length===0){const d={...a[date]};delete d[empId];if(Object.keys(d).length===0)delete a[date];else a[date]=d;}
      else a[date]={...a[date],[empId]:filtered};
    } else {
      // Add shift to array
      a[date]={...a[date],[empId]:[...cur,shiftId]};
    }
    onUpdate({...company,assignments:a});
  };
  const removeShiftFromDay=(date,empId,shiftId)=>{
    const a={...company.assignments};
    if(a[date]&&a[date][empId]){
      const cur=Array.isArray(a[date][empId])?a[date][empId]:[a[date][empId]];
      const filtered=cur.filter(s=>s!==shiftId);
      if(filtered.length===0){const d={...a[date]};delete d[empId];if(Object.keys(d).length===0)delete a[date];else a[date]=d;}
      else a[date]={...a[date],[empId]:filtered};
      onUpdate({...company,assignments:a});
    }
  };
  const removeAllFromDay=(date,empId)=>{
    const a={...company.assignments};
    if(a[date]){
      const d={...a[date]};delete d[empId];
      if(Object.keys(d).length===0) delete a[date]; else a[date]=d;
      onUpdate({...company,assignments:a});
    }
  };

  const addEmployee=()=>{
    if(!newEmpName.trim())return;
    if(company.employees.length>=MAX_EMPS){showToast(t.maxEmps,"warn");return;}
    const emp={id:uid(),name:newEmpName.trim(),role:newEmpRole.trim().toUpperCase(),hoursPerDay:Number(newEmpHours)||8,ptoDays:newEmpPTO?Number(newEmpPTO):null,startDate:newEmpStartDate||null,endDate:null,status:"active"};
    onUpdate({...company,employees:[...company.employees,emp]});
    setNewEmpName("");setNewEmpRole("");setNewEmpHours(8);setNewEmpPTO("");setNewEmpStartDate("");setShowAddEmp(false);
    showToast(`${emp.name} added`);
  };

  const openEditEmp=(emp)=>{
    setEditingEmp(emp.id);
    setEditEmpName(emp.name);
    setEditEmpRole(emp.role||"");
    setEditEmpHours(emp.hoursPerDay||8);
    setEditEmpPTO(emp.ptoDays!=null?emp.ptoDays:"");
    setEditEmpStartDate(emp.startDate||"");
    setEditEmpEndDate(emp.endDate||"");
    setShowEditEmp(true);
  };

  const saveEditEmp=()=>{
    if(!editEmpName.trim()||!editingEmp)return;
    const emps=company.employees.map(e=>e.id===editingEmp?{...e,name:editEmpName.trim(),role:editEmpRole.trim().toUpperCase(),hoursPerDay:Number(editEmpHours)||8,ptoDays:editEmpPTO!==""?Number(editEmpPTO):null,startDate:editEmpStartDate||null,endDate:editEmpEndDate||null,status:editEmpEndDate?"terminated":"active"}:e);
    onUpdate({...company,employees:emps});
    setShowEditEmp(false);setEditingEmp(null);
    showToast("Angajat actualizat");
  };

  const terminateEmployee=(empId,lastDay)=>{
    const emps=company.employees.map(e=>e.id===empId?{...e,endDate:lastDay,status:"terminated"}:e);
    onUpdate({...company,employees:emps});
    setShowTerminate(false);setTerminateDate("");
    showToast("Contract încheiat");
  };

  const deleteEmployee=(id)=>{
    const emps=company.employees.filter(e=>e.id!==id);
    // Remove assignments
    const a={...company.assignments};
    Object.keys(a).forEach(date=>{
      if(a[date]&&a[date][id]){const d={...a[date]};delete d[id];if(Object.keys(d).length===0)delete a[date];else a[date]=d;}
    });
    onUpdate({...company,employees:emps,assignments:a});
    if(selEmp===id){setSelEmp(null);setSelShift(null);}
    showToast("Employee removed");
  };

  const addShift=()=>{
    if(!newShiftName.trim())return;
    if(company.shifts.length>=MAX_SHIFTS){showToast(t.maxShifts,"warn");return;}
    const color=SHIFT_COLORS[company.shifts.length%SHIFT_COLORS.length];
    const shift={id:uid(),name:newShiftName.trim(),start:newShiftStart,end:newShiftEnd,color};
    onUpdate({...company,shifts:[...company.shifts,shift]});
    setNewShiftName("");setNewShiftStart("09:00");setNewShiftEnd("17:00");setShowAddShift(false);
    showToast(`Shift "${shift.name}" created`);
  };

  const deleteShift=(id)=>{
    const shifts=company.shifts.filter(s=>s.id!==id);
    // Remove assignments using this shift (array-aware)
    const a={...company.assignments};
    Object.keys(a).forEach(date=>{
      const d={...a[date]};
      Object.keys(d).forEach(empId=>{
        const cur=Array.isArray(d[empId])?d[empId]:[d[empId]];
        const filtered=cur.filter(s=>s!==id);
        if(filtered.length===0)delete d[empId]; else d[empId]=filtered;
      });
      if(Object.keys(d).length===0)delete a[date];else a[date]=d;
    });
    onUpdate({...company,shifts:shifts,assignments:a});
    if(selShift===id)setSelShift(null);
    showToast("Tură ștearsă");
  };

  const addLeave=()=>{
    if(!newLeaveName.trim())return;
    const defaultMatch=DEFAULT_LEAVES.find(dl=>dl.name===newLeaveName.trim());
    const lv={id:"lv_"+uid(),name:newLeaveName.trim(),short:newLeaveShort.trim()||newLeaveName.trim().slice(0,3).toUpperCase(),
      color:defaultMatch?defaultMatch.color:SHIFT_COLORS[(company.leaves||[]).length%SHIFT_COLORS.length]};
    onUpdate({...company,leaves:[...(company.leaves||[]),lv]});
    setNewLeaveName("");setNewLeaveShort("");setShowAddLeave(false);
    showToast("Concediu creat");
  };

  const deleteLeave=(id)=>{
    const leaves=(company.leaves||[]).filter(l=>l.id!==id);
    // Remove leave assignments
    const la={...(company.leaveAssignments||{})};
    Object.keys(la).forEach(date=>{
      const d={...la[date]};
      Object.keys(d).forEach(empId=>{if(d[empId]===id)delete d[empId]});
      if(Object.keys(d).length===0)delete la[date];else la[date]=d;
    });
    onUpdate({...company,leaves,leaveAssignments:la});
    if(selLeave===id)setSelLeave(null);
    showToast("Concediu șters");
  };

  const assignLeave=(date,empId,leaveId)=>{
    const la={...(company.leaveAssignments||{})};
    if(!la[date])la[date]={};
    if(la[date][empId]===leaveId){
      const d={...la[date]};delete d[empId];
      if(Object.keys(d).length===0)delete la[date];else la[date]=d;
    } else {
      la[date]={...la[date],[empId]:leaveId};
    }
    onUpdate({...company,leaveAssignments:la});
  };

  const removeLeaveFromDay=(date,empId)=>{
    const la={...(company.leaveAssignments||{})};
    if(la[date]){
      const d={...la[date]};delete d[empId];
      if(Object.keys(d).length===0)delete la[date];else la[date]=d;
      onUpdate({...company,leaveAssignments:la});
    }
  };


  const copyWeekForward=()=>{
    // Find current week's Monday
    const d=new Date(curYear,curMonth,1);
    // Get all assignments for current month
    // Copy week containing today (or first week) to next week
    const todayDate=new Date();
    const curMonday=new Date(todayDate);
    curMonday.setDate(curMonday.getDate()-(curMonday.getDay()+6)%7);
    const nextMonday=new Date(curMonday);
    nextMonday.setDate(nextMonday.getDate()+7);

    const a={...company.assignments};
    for(let i=0;i<7;i++){
      const src=new Date(curMonday);src.setDate(src.getDate()+i);
      const dst=new Date(nextMonday);dst.setDate(dst.getDate()+i);
      const srcKey=`${src.getFullYear()}-${pad2(src.getMonth()+1)}-${pad2(src.getDate())}`;
      const dstKey=`${dst.getFullYear()}-${pad2(dst.getMonth()+1)}-${pad2(dst.getDate())}`;
      if(a[srcKey]) a[dstKey]=JSON.parse(JSON.stringify(a[srcKey]));
    }
    onUpdate({...company,assignments:a});
    showToast(t.weekCopied);
  };

  // Calculate weekly hours for selected employee
  const weeklyHours=useMemo(()=>{
    if(!selEmp)return {};
    const hours={};
    Object.entries(company.assignments).forEach(([date,dayA])=>{
      if(dayA[selEmp]){
        const shiftIds=Array.isArray(dayA[selEmp])?dayA[selEmp]:[dayA[selEmp]];
        shiftIds.forEach(sid=>{
          const shift=company.shifts.find(s=>s.id===sid);
          if(shift){
            const d=new Date(date);
            const weekStart=new Date(d);weekStart.setDate(d.getDate()-(d.getDay()+6)%7);
            const wk=weekStart.toISOString().slice(0,10);
            hours[wk]=(hours[wk]||0)+shiftDuration(shift.start,shift.end);
          }
        });
      }
    });
    return hours;
  },[selEmp,company.assignments,company.shifts]);


  // Contracted hours per employee for current month
  // Romanian labour law: always based on LEGAL working days (Mon-Fri, excluding public holidays)
  // regardless of company operating days — Art. 112 Codul Muncii
  const empContractedHours=useMemo(()=>{
    const hols=getHolidays(company.country,curYear);
    const result={};
    company.employees.forEach(emp=>{
      const hpd=emp.hoursPerDay||8;
      let legalWorkingDays=0;
      const daysInM=getDaysInMonth(curYear,curMonth);
      for(let d=1;d<=daysInM;d++){
        const dow=(getFirstDayOfMonth(curYear,curMonth)+d-1)%7;
        const isWeekday=dow>=0&&dow<=4; // Mon=0..Fri=4
        const date=`${curYear}-${pad2(curMonth+1)}-${pad2(d)}`;
        const isHoliday=!!hols[date];
        if(isWeekday&&!isHoliday) legalWorkingDays++;
      }
      result[emp.id]=legalWorkingDays*hpd;
    });
    return result;
  },[company,curMonth,curYear]);

  // Allocated hours per employee — split into normal, overtime, holiday
  const holidays=useMemo(()=>getHolidays(company.country,curYear),[company.country,curYear]);
  const empMonthHoursDetail=useMemo(()=>{
    const result={};
    company.employees.forEach(emp=>{
      let normalH=0,holidayH=0;
      Object.entries(company.assignments).forEach(([date,dayA])=>{
        if(dayA[emp.id]){
          const [y,m]=date.split("-").map(Number);
          if(y===curYear&&m-1===curMonth){
            const ids=Array.isArray(dayA[emp.id])?dayA[emp.id]:[dayA[emp.id]];
            const isHol=!!holidays[date];
            ids.forEach(sid=>{
              const shift=company.shifts.find(s=>s.id===sid);
              if(shift){
                const h=shiftDuration(shift.start,shift.end);
                if(isHol) holidayH+=h; else normalH+=h;
              }
            });
          }
        }
      });
      const contracted=empContractedHours[emp.id]||0;
      const overtime=Math.max(0,normalH-contracted);
      const normalCapped=Math.min(normalH,contracted);
      result[emp.id]={normal:normalCapped,overtime,holiday:holidayH,total:normalH+holidayH};
    });
    return result;
  },[company,curMonth,curYear,holidays,empContractedHours]);
  // Backward compat alias
  const empMonthHours=useMemo(()=>{
    const r={};Object.entries(empMonthHoursDetail).forEach(([id,d])=>{r[id]=d.total});return r;
  },[empMonthHoursDetail]);


  const openAdminSettings=()=>{
    setEditCompanyName(company.name);
    setEditCompanyCountry(company.country);
    setEditOpDays(JSON.parse(JSON.stringify(company.opDays||{mon:{active:true,start:"09:00",end:"17:00"},tue:{active:true,start:"09:00",end:"17:00"},wed:{active:true,start:"09:00",end:"17:00"},thu:{active:true,start:"09:00",end:"17:00"},fri:{active:true,start:"09:00",end:"17:00"},sat:{active:false,start:"10:00",end:"14:00"},sun:{active:false,start:"10:00",end:"14:00"}})));
    setShowAdminSettings(true);
  };

  const saveAdminSettings=()=>{
    onUpdate({...company,name:editCompanyName.trim()||company.name,country:editCompanyCountry,opDays:editOpDays});
    setShowAdminSettings(false);
    showToast("Setări salvate");
  };

  const toggleEditDay=(day)=>setEditOpDays(prev=>({...prev,[day]:{...prev[day],active:!prev[day].active}}));
  const setEditDayTime=(day,field,val)=>setEditOpDays(prev=>({...prev,[day]:{...prev[day],[field]:val}}));

  const copyToClipboard=(text)=>{
    navigator.clipboard.writeText(text).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000)});
  };

  const adminUrl=`${typeof window!=="undefined"?window.location.origin:""}?company=${company.id}&role=admin`;
  const memberUrl=(empId)=>`${typeof window!=="undefined"?window.location.origin:""}?company=${company.id}&member=${empId}`;

  return <div style={{minHeight:"100vh",background:th.bg,fontFamily:F,overflow:"hidden"}}>
    {/* ── CRYSTAL DOCK HEADER ── */}
    <header style={{
      padding:"10px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",
      background:th.hdr,backdropFilter:G.blur,WebkitBackdropFilter:G.blur,
      borderBottom:`1px solid ${th.bd}`,position:"sticky",top:0,zIndex:100,
    }}>
      <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
        <button onClick={onGoHome} style={{
          width:32,height:32,borderRadius:10,background:th.acG,border:"none",cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:`0 2px 8px ${th.ac}30`,
        }}><Icons.Home s={16} c="#fff"/></button>
        <span style={{fontSize:15,fontWeight:800,color:th.tx,letterSpacing:"-0.02em",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
          {COUNTRIES.find(c=>c.code===company.country)?.flag} {company.name}
        </span>
      </div>
      {/* Dock-style action pills */}
      <div style={{display:"inline-flex",gap:3,padding:"4px 6px",borderRadius:14,
        background:th.gbg,border:`1px solid ${th.gbd}`,backdropFilter:G.blur,WebkitBackdropFilter:G.blur}}>
        <button onClick={openAdminSettings} style={{width:30,height:30,borderRadius:10,border:"none",cursor:"pointer",
          background:th.acS,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}}>
          <Icons.Settings s={14} c={th.ac}/>
        </button>
        <button onClick={()=>setShowShare(true)} style={{width:30,height:30,borderRadius:10,border:"none",cursor:"pointer",
          background:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Icons.Share s={14} c={th.t2}/>
        </button>
        <button onClick={copyWeekForward} style={{width:30,height:30,borderRadius:10,border:"none",cursor:"pointer",
          background:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Icons.CopyFwd s={14} c={th.t2}/>
        </button>
        <div style={{width:1,background:th.bd,margin:"4px 2px"}}/>
        <ThemeSwitcher theme={theme} setTheme={setTheme} th={th}/>
      </div>
    </header>

    {/* ── FLOATING PANELS LAYOUT ── */}
    <div style={{display:"flex",gap:12,padding:12,minHeight:"calc(100vh - 57px)",alignItems:"flex-start"}}>

      {/* ═══ LEFT FLOATING PANEL — Team + Shifts + Leaves ═══ */}
      <aside style={{
        width:300,flexShrink:0,borderRadius:G.rL,
        background:th.card,border:`1px solid ${th.gbd}`,
        boxShadow:th.cardS,backdropFilter:G.blur,WebkitBackdropFilter:G.blur,
        padding:14,overflow:"auto",maxHeight:"calc(100vh - 81px)",
        display:"flex",flexDirection:"column",gap:10,
      }}>
        {/* Sticky Add Employee button */}
        <button onClick={()=>setShowAddEmp(true)} style={{
          width:"100%",padding:"10px 14px",borderRadius:G.rS,border:`1.5px dashed ${th.ac}40`,
          background:th.acS,color:th.ac,fontSize:12,fontWeight:700,fontFamily:F,
          cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,
          transition:"all 0.15s",position:"sticky",top:0,zIndex:5,
        }}><Icons.Plus s={14} c={th.ac}/> {t.addEmployee}</button>

        {/* ── OPTION B: 65/35 SPLIT with accent bar, grouped leaves, status badges ── */}
        <div style={{display:"flex",gap:8,flex:1,minHeight:0}}>

          {/* ═══ LEFT 65%: Employees ═══ */}
          <div style={{flex:65,minWidth:0,overflow:"auto",display:"flex",flexDirection:"column",gap:2}}>
            {/* Collapsible header */}
            <div style={{
              display:"flex",justifyContent:"space-between",alignItems:"center",padding:"2px 0",
            }}>
              <span style={{fontSize:10,fontWeight:700,color:th.t3,textTransform:"uppercase",letterSpacing:"0.06em"}}>
                {t.employees} ({company.employees.length})
              </span>
            </div>
            {company.employees.length===0&&<p style={{fontSize:11,color:th.t3,textAlign:"center",padding:"12px 0"}}>{t.noEmployees}</p>}

            {(()=>{
              const sorted=[...company.employees].sort((a,b)=>(a.role||"zzz").toUpperCase().localeCompare((b.role||"zzz").toUpperCase()));
              const groups={};
              sorted.forEach(emp=>{const r=(emp.role||"GENERAL").toUpperCase();if(!groups[r])groups[r]=[];groups[r].push(emp);});
              return Object.entries(groups).map(([role,emps])=><div key={role}>
                {Object.keys(groups).length>1&&<div style={{
                  fontSize:7,fontWeight:800,color:th.ac,textTransform:"uppercase",letterSpacing:"0.06em",
                  padding:"2px 6px",marginBottom:2,marginTop:4,background:th.acS,borderRadius:4,
                }}>{role}</div>}
                {emps.map(emp=>{
                  const isSelected=selEmp===emp.id;
                  const isTerm=emp.status==="terminated";
                  const d=empMonthHoursDetail[emp.id]||{normal:0,overtime:0,holiday:0,total:0};
                  const ct=empContractedHours[emp.id]||0;
                  return <div key={emp.id}
                    onClick={()=>{setSelEmp(isSelected?null:emp.id);if(!isSelected){setSelShift(null);setSelLeave(null);}}}
                    style={{
                      padding:"6px 8px",borderRadius:G.rS,cursor:"pointer",marginBottom:2,
                      border:isSelected?`2px solid ${th.ac}`:`1px solid ${isTerm?th.bd2:th.bd2}`,
                      background:isSelected?th.acS:"transparent",
                      display:"flex",alignItems:"center",gap:6,transition:"all 0.2s",
                      position:"relative",opacity:isTerm?0.5:1,
                      boxShadow:isSelected?`0 0 12px ${th.ac}20`:"none",
                    }}>
                    {/* Left accent bar for selected */}
                    {isSelected&&<div style={{
                      position:"absolute",left:-1,top:6,bottom:6,width:3,borderRadius:2,background:th.ac,
                    }}/>}
                    {/* Avatar */}
                    <div style={{
                      width:26,height:26,borderRadius:8,flexShrink:0,
                      background:isTerm?th.t3+"50":(isSelected?th.acG:`linear-gradient(135deg,${th.t3},${th.t2})`),
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:11,fontWeight:700,color:"#fff",
                    }}>{emp.name.charAt(0).toUpperCase()}</div>
                    {/* Info */}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11,fontWeight:700,color:isTerm?th.t3:th.tx,
                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
                        textDecoration:isTerm?"line-through":"none"}}>
                        {emp.name}
                      </div>
                      {/* Hours line */}
                      <div style={{display:"flex",alignItems:"center",gap:3,marginTop:2}}>
                        <span style={{fontSize:9,fontWeight:600,color:d.total>=ct*0.9?th.ok:th.t2}}>{formatHours(d.total)}h</span>
                        <span style={{fontSize:9,color:th.t3}}>/ {formatHours(ct)}h</span>
                        {d.overtime>0&&<span style={{fontSize:7,color:th.warn,fontWeight:700}}>+{formatHours(d.overtime)}OT</span>}
                        {d.holiday>0&&<span style={{fontSize:7,color:"#d946ef",fontWeight:700}}>+{formatHours(d.holiday)}x2</span>}
                      </div>
                      {/* Status badge */}
                      <div style={{display:"flex",gap:4,alignItems:"center",marginTop:2}}>
                        {isTerm?<span style={{
                          fontSize:7,padding:"1px 5px",borderRadius:8,fontWeight:700,
                          background:th.er+"15",color:th.er,
                        }}>{t.terminated} {emp.endDate?emp.endDate.slice(5).replace("-","."):""}</span>
                        :<span style={{
                          fontSize:7,padding:"1px 5px",borderRadius:8,fontWeight:700,
                          background:th.ok+"15",color:th.ok,
                        }}>{t.active}</span>}
                        {emp.startDate&&<span style={{fontSize:7,color:th.t3}}>
                          {lang==="ro"?"din":"from"} {emp.startDate.slice(5).replace("-",".")}
                        </span>}
                      </div>
                    </div>
                    {/* Action buttons */}
                    <div style={{display:"flex",flexDirection:"column",gap:2,flexShrink:0}}>
                      <button onClick={e=>{e.stopPropagation();openEditEmp(emp)}}
                        style={{background:"none",border:"none",cursor:"pointer",padding:2}}>
                        <Icons.Edit s={10} c={th.t3}/>
                      </button>
                      <button onClick={e=>{e.stopPropagation();deleteEmployee(emp.id)}}
                        style={{background:"none",border:"none",cursor:"pointer",padding:2}}>
                        <Icons.Trash s={10} c={th.t3}/>
                      </button>
                    </div>
                  </div>;
                })}
              </div>);
            })()}
          </div>

          {/* ═══ RIGHT 35%: Shifts + Leaves ═══ */}
          <div style={{flex:35,flexShrink:0,overflow:"auto",display:"flex",flexDirection:"column",gap:6,
            borderLeft:`1px solid ${th.bd2}`,paddingLeft:8}}>

            {/* ── Shifts Section (collapsible) ── */}
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <div onClick={()=>setShiftsOpen(p=>!p)} style={{
                  display:"flex",alignItems:"center",gap:4,cursor:"pointer",
                }}>
                  <span style={{fontSize:9,fontWeight:700,color:th.t3,textTransform:"uppercase",letterSpacing:"0.06em"}}>
                    {t.shifts} ({company.shifts.length})
                  </span>
                  <span style={{fontSize:8,color:th.t3,transform:shiftsOpen?"rotate(180deg)":"rotate(0deg)",
                    transition:"transform 0.2s",display:"inline-block"}}>▼</span>
                </div>
                <button onClick={()=>setShowAddShift(true)} style={{
                  background:"none",border:"none",cursor:"pointer",padding:1,
                  position:"sticky",top:0,
                }}>
                  <Icons.Plus s={12} c={th.ac}/>
                </button>
              </div>
              {shiftsOpen&&<>
                {company.shifts.length===0&&<button onClick={()=>setShowAddShift(true)} style={{
                  width:"100%",padding:"6px",borderRadius:G.rXs,border:`1px dashed ${th.ac}40`,
                  background:th.acS,color:th.ac,fontSize:9,fontWeight:700,fontFamily:F,cursor:"pointer",
                }}>{t.addShift}</button>}
                <div style={{display:"flex",flexDirection:"column",gap:2}}>
                  {company.shifts.map((s,idx)=>{
                    const isShiftSel=selShift===s.id;
                    return <div key={s.id}
                      draggable onDragStart={()=>setDragIdx(idx)}
                      onDragOver={e=>{e.preventDefault();setDragOverIdx(idx);}}
                      onDragLeave={()=>setDragOverIdx(null)}
                      onDrop={e=>{e.preventDefault();handleShiftReorder(dragIdx,idx);setDragIdx(null);setDragOverIdx(null);}}
                      onDragEnd={()=>{setDragIdx(null);setDragOverIdx(null);}}
                      onClick={()=>{if(selEmp){setSelShift(isShiftSel?null:s.id);setSelLeave(null);}}}
                      style={{
                        padding:"4px 6px",borderRadius:6,cursor:selEmp?"pointer":"grab",
                        border:`1px solid ${isShiftSel?s.color:th.bd2}`,
                        background:isShiftSel?s.color+"22":"transparent",
                        display:"flex",alignItems:"center",gap:4,transition:"all 0.15s",
                        opacity:dragIdx===idx?0.4:1,
                      }}>
                      <div style={{width:8,height:8,borderRadius:3,background:s.color,flexShrink:0}}/>
                      <span style={{fontSize:9,fontWeight:isShiftSel?700:500,color:isShiftSel?th.tx:th.t2,
                        flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</span>
                      <button onClick={e=>{e.stopPropagation();deleteShift(s.id)}}
                        style={{background:"none",border:"none",cursor:"pointer",padding:0,flexShrink:0}}>
                        <Icons.Trash s={8} c={th.t3}/>
                      </button>
                    </div>;
                  })}
                </div>
              </>}
            </div>

            <div style={{height:1,background:th.bd}}/>

            {/* ── Leaves Section (collapsible + grouped) ── */}
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <div onClick={()=>setLeavesOpen(p=>!p)} style={{
                  display:"flex",alignItems:"center",gap:4,cursor:"pointer",
                }}>
                  <span style={{fontSize:9,fontWeight:700,color:th.t3,textTransform:"uppercase",letterSpacing:"0.06em"}}>
                    {t.leaves} ({(company.leaves||[]).length})
                  </span>
                  <span style={{fontSize:8,color:th.t3,transform:leavesOpen?"rotate(180deg)":"rotate(0deg)",
                    transition:"transform 0.2s",display:"inline-block"}}>▼</span>
                </div>
                <div style={{display:"flex",gap:4,alignItems:"center"}}>
                  <button onClick={()=>setShowAddLeave(true)} style={{background:"none",border:"none",cursor:"pointer",padding:1}}>
                    <Icons.Plus s={12} c={th.ac}/>
                  </button>
                  {(company.leaves||[]).length>0&&<div onClick={()=>setShowLeaveLegend(true)} style={{
                    width:16,height:16,borderRadius:8,background:th.t3+"25",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    cursor:"pointer",fontSize:9,fontWeight:800,color:th.t3,
                  }}>?</div>}
                </div>
              </div>
              {leavesOpen&&<>
                {(company.leaves||[]).length===0&&<p style={{fontSize:9,color:th.t3,textAlign:"center"}}>{t.noLeaves}</p>}
                {(()=>{
                  const allLeaves=company.leaves||[];
                  const frequent=allLeaves.filter(lv=>["CO","CM"].includes(lv.short));
                  const others=allLeaves.filter(lv=>!["CO","CM"].includes(lv.short));
                  const renderLeave=(lv)=>{
                    const isLvSel=selLeave===lv.id;
                    return <div key={lv.id}
                      onClick={()=>{if(selEmp){setSelLeave(isLvSel?null:lv.id);setSelShift(null);}}}
                      style={{
                        padding:"4px 5px",borderRadius:5,cursor:selEmp?"pointer":"default",
                        border:`1.5px solid ${isLvSel?lv.color:lv.color+"40"}`,
                        background:isLvSel?lv.color+"30":lv.color+"10",
                        display:"flex",alignItems:"center",gap:4,transition:"all 0.12s",
                      }}>
                      <div style={{width:9,height:9,borderRadius:3,background:lv.color,flexShrink:0}}/>
                      <span style={{fontSize:9,fontWeight:700,color:isLvSel?lv.color:th.tx,
                        flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lv.short}</span>
                      <button onClick={e=>{e.stopPropagation();deleteLeave(lv.id)}}
                        style={{background:"none",border:"none",cursor:"pointer",padding:0,flexShrink:0}}>
                        <Icons.Trash s={8} c={th.t3}/>
                      </button>
                    </div>;
                  };
                  return <>
                    {frequent.length>0&&<div style={{display:"flex",flexDirection:"column",gap:2,marginBottom:4}}>
                      {frequent.map(renderLeave)}
                    </div>}
                    {others.length>0&&<>
                      <div onClick={()=>setOtherLeavesOpen(p=>!p)} style={{
                        padding:"4px 6px",borderRadius:5,cursor:"pointer",textAlign:"center",
                        background:th.t3+"08",fontSize:8,fontWeight:600,color:th.t3,
                        display:"flex",alignItems:"center",justifyContent:"center",gap:3,marginBottom:2,
                      }}>
                        <span>{otherLeavesOpen?(lang==="ro"?"Ascunde":"Hide"):(lang==="ro"?`+${others.length} concedii`:`+${others.length} more`)}</span>
                        <span style={{fontSize:7,transform:otherLeavesOpen?"rotate(180deg)":"rotate(0deg)",
                          transition:"transform 0.2s",display:"inline-block"}}>▼</span>
                      </div>
                      {otherLeavesOpen&&<div style={{display:"flex",flexDirection:"column",gap:2}}>
                        {others.map(renderLeave)}
                      </div>}
                    </>}
                  </>;
                })()}
              </>}
            </div>
          </div>
        </div>
      </aside>

      {/* ═══ RIGHT — Calendar + Dashboard Floating Panel ═══ */}
      <main style={{flex:1,overflow:"auto",maxHeight:"calc(100vh - 81px)",display:"flex",flexDirection:"column",gap:12}}>

        {/* ── Calendar Floating Glass Card ── */}
        <div style={{
          borderRadius:G.rL,background:th.card,border:`1px solid ${th.gbd}`,
          boxShadow:th.cardS,backdropFilter:G.blur,WebkitBackdropFilter:G.blur,
          padding:16,
        }}>
          {/* Month navigation */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <button onClick={goPrev} disabled={!canPrev()} style={{
              width:32,height:32,borderRadius:10,border:"none",cursor:canPrev()?"pointer":"default",
              background:canPrev()?th.acS:th.bd2,display:"flex",alignItems:"center",justifyContent:"center",
              opacity:canPrev()?1:0.3,transition:"all 0.15s",
            }}><Icons.ChevLeft s={16} c={canPrev()?th.ac:th.t3}/></button>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:16,fontWeight:800,color:th.tx}}>
                {[t.jan,t.feb,t.mar,t.apr,t.may,t.jun,t.jul,t.aug,t.sep,t.oct,t.nov,t.dec][curMonth]} {curYear}
              </div>
              {selEmp&&<div style={{fontSize:11,color:th.ac,fontWeight:600,marginTop:2}}>
                {company.employees.find(e=>e.id===selEmp)?.name}
                {selShift&&<span style={{color:company.shifts.find(s=>s.id===selShift)?.color}}> — {company.shifts.find(s=>s.id===selShift)?.name}</span>}
                {selLeave&&<span style={{color:(company.leaves||[]).find(l=>l.id===selLeave)?.color,fontStyle:"italic"}}> — {(company.leaves||[]).find(l=>l.id===selLeave)?.name}</span>}
              </div>}
            </div>
            <button onClick={goNext} disabled={!canNext()} style={{
              width:32,height:32,borderRadius:10,border:"none",cursor:canNext()?"pointer":"default",
              background:canNext()?th.acS:th.bd2,display:"flex",alignItems:"center",justifyContent:"center",
              opacity:canNext()?1:0.3,transition:"all 0.15s",
            }}><Icons.ChevRight s={16} c={canNext()?th.ac:th.t3}/></button>
          </div>

          {/* Export & Actions Bar */}
          <div style={{
            display:"flex",alignItems:"center",justifyContent:"space-between",
            padding:"8px 12px",borderRadius:G.rS,background:th.gbg,border:`1px solid ${th.gbd}`,
            marginBottom:12,backdropFilter:G.blurS,WebkitBackdropFilter:G.blurS,flexWrap:"wrap",gap:6,
          }}>
            <div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}>
              {/* CSV Export */}
              <button onClick={()=>{
                const hdr=["Angajat","Funcție","Data","Tip","Detaliu","Ore"];
                const rows=[];
                company.employees.forEach(emp=>{
                  Object.entries(company.assignments).forEach(([date,dayA])=>{
                    if(dayA[emp.id]){
                      const ids=Array.isArray(dayA[emp.id])?dayA[emp.id]:[dayA[emp.id]];
                      ids.forEach(sid=>{const sh=company.shifts.find(s=>s.id===sid);
                        if(sh)rows.push([emp.name,emp.role||"",date,"Tură",sh.name+" ("+sh.start+"-"+sh.end+")",formatHours(shiftDuration(sh.start,sh.end))]);
                      });
                    }
                  });
                  Object.entries(company.leaveAssignments||{}).forEach(([date,la])=>{
                    if(la[emp.id]){const lv=(company.leaves||[]).find(l=>l.id===la[emp.id]);
                      if(lv)rows.push([emp.name,emp.role||"",date,"Concediu",lv.name,"–"]);
                    }
                  });
                });
                const csv="\uFEFF"+[hdr,...rows].map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(",")).join("\n");
                const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
                const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=company.name+"_program.csv";a.click();
              }} style={{padding:"5px 10px",borderRadius:6,border:`1px solid ${th.bd}`,background:th.cellBg,
                cursor:"pointer",fontSize:10,fontWeight:600,color:th.t2,fontFamily:F,display:"flex",alignItems:"center",gap:4}}>
                <Icons.Download s={12} c={th.t2}/> CSV
              </button>
              {/* Excel XLSX Export (SpreadsheetML XML) */}
              <button onClick={()=>{
                const ws=["<tr><th>Angajat</th><th>Funcție</th><th>Data</th><th>Tip</th><th>Detaliu</th><th>Ore</th></tr>"];
                company.employees.forEach(emp=>{
                  Object.entries(company.assignments).forEach(([date,dayA])=>{
                    if(dayA[emp.id]){
                      const ids=Array.isArray(dayA[emp.id])?dayA[emp.id]:[dayA[emp.id]];
                      ids.forEach(sid=>{const sh=company.shifts.find(s=>s.id===sid);
                        if(sh)ws.push("<tr><td>"+emp.name+"</td><td>"+(emp.role||"")+"</td><td>"+date+"</td><td>Tură</td><td>"+sh.name+"</td><td>"+formatHours(shiftDuration(sh.start,sh.end))+"</td></tr>");
                      });
                    }
                  });
                  Object.entries(company.leaveAssignments||{}).forEach(([date,la])=>{
                    if(la[emp.id]){const lv=(company.leaves||[]).find(l=>l.id===la[emp.id]);
                      if(lv)ws.push("<tr><td>"+emp.name+"</td><td>"+(emp.role||"")+"</td><td>"+date+"</td><td>Concediu</td><td>"+lv.name+"</td><td>–</td></tr>");
                    }
                  });
                });
                const html="<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:excel'><head><meta charset='UTF-8'/></head><body><table border='1'>"+ws.join("")+"</table></body></html>";
                const blob=new Blob([html],{type:"application/vnd.ms-excel"});
                const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=company.name+"_program.xls";a.click();
              }} style={{padding:"5px 10px",borderRadius:6,border:`1px solid ${th.bd}`,background:th.cellBg,
                cursor:"pointer",fontSize:10,fontWeight:600,color:th.t2,fontFamily:F,display:"flex",alignItems:"center",gap:4}}>
                <Icons.Download s={12} c={th.t2}/> Excel
              </button>
              {/* PDF-like HTML Export */}
              <button onClick={()=>{
                const monthNames=[t.jan,t.feb,t.mar,t.apr,t.may,t.jun,t.jul,t.aug,t.sep,t.oct,t.nov,t.dec];
                let html="<!DOCTYPE html><html><head><meta charset='UTF-8'/><title>"+company.name+" — "+monthNames[curMonth]+" "+curYear+"</title><style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse;font-size:11px}th,td{border:1px solid #ddd;padding:4px 6px;text-align:center}th{background:#f0f4fa;font-weight:700}.shift{display:inline-block;padding:1px 4px;border-radius:3px;color:#fff;font-size:9px;font-weight:700}.leave{font-style:italic;font-size:9px}h1{font-size:18px}h2{font-size:14px;color:#666}@media print{body{padding:0}}</style></head><body>";
                html+="<h1>"+company.name+"</h1><h2>"+monthNames[curMonth]+" "+curYear+"</h2><table><tr><th>Angajat</th>";
                const days=getDaysInMonth(curYear,curMonth);
                const dayKeys2=["mon","tue","wed","thu","fri","sat","sun"];
                const dayN=["L","M","M","J","V","S","D"];
                for(let d=1;d<=days;d++){const dow=(getFirstDayOfMonth(curYear,curMonth)+d-1)%7;html+="<th>"+dayN[dow]+d+"</th>";}
                html+="<th>Total</th></tr>";
                company.employees.forEach(emp=>{
                  html+="<tr><td style='text-align:left;font-weight:600'>"+emp.name+"</td>";
                  let totalH=0;
                  for(let d=1;d<=days;d++){
                    const date=curYear+"-"+pad2(curMonth+1)+"-"+pad2(d);
                    const dayA=company.assignments[date]||{};
                    const raw=dayA[emp.id];const ids=raw?(Array.isArray(raw)?raw:[raw]):[];
                    const la=(company.leaveAssignments||{})[date]||{};const lvId=la[emp.id];
                    let cell="";
                    ids.forEach(sid=>{const sh=company.shifts.find(s=>s.id===sid);if(sh){cell+="<span class='shift' style='background:"+sh.color+"'>"+sh.name+"</span> ";totalH+=shiftDuration(sh.start,sh.end);}});
                    if(lvId){const lv=(company.leaves||[]).find(l=>l.id===lvId);if(lv)cell+="<span class='leave' style='color:"+lv.color+"'>"+lv.short+"</span>";}
                    html+="<td>"+cell+"</td>";
                  }
                  html+="<td><b>"+formatHours(totalH)+"h</b></td></tr>";
                });
                html+="</table></body></html>";
                const blob=new Blob([html],{type:"text/html"});
                const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=company.name+"_program.html";a.click();
              }} style={{padding:"5px 10px",borderRadius:6,border:`1px solid ${th.bd}`,background:th.cellBg,
                cursor:"pointer",fontSize:10,fontWeight:600,color:th.t2,fontFamily:F,display:"flex",alignItems:"center",gap:4}}>
                <Icons.Download s={12} c={th.t2}/> PDF/HTML
              </button>
              {/* Print */}
              <button onClick={()=>{
                const monthNames=[t.jan,t.feb,t.mar,t.apr,t.may,t.jun,t.jul,t.aug,t.sep,t.oct,t.nov,t.dec];
                const days=getDaysInMonth(curYear,curMonth);
                const dayN=["L","M","M","J","V","S","D"];
                let html="<html><head><title>Print</title><style>body{font-family:sans-serif;font-size:10px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:3px 4px;text-align:center}th{background:#eee}.s{display:inline-block;padding:1px 3px;border-radius:2px;color:#fff;font-size:8px;font-weight:700}</style></head><body>";
                html+="<h2>"+company.name+" — "+monthNames[curMonth]+" "+curYear+"</h2><table><tr><th>Angajat</th>";
                for(let d=1;d<=days;d++){const dow=(getFirstDayOfMonth(curYear,curMonth)+d-1)%7;html+="<th>"+dayN[dow]+d+"</th>";}
                html+="<th>Ore</th></tr>";
                company.employees.forEach(emp=>{
                  html+="<tr><td style='text-align:left;font-weight:600;white-space:nowrap'>"+emp.name+"</td>";
                  let h=0;
                  for(let d=1;d<=days;d++){
                    const date=curYear+"-"+pad2(curMonth+1)+"-"+pad2(d);
                    const dayA=company.assignments[date]||{};const raw=dayA[emp.id];
                    const ids=raw?(Array.isArray(raw)?raw:[raw]):[];
                    const la=(company.leaveAssignments||{})[date]||{};const lvId=la[emp.id];
                    let cell="";
                    ids.forEach(sid=>{const sh=company.shifts.find(s=>s.id===sid);if(sh){cell+="<span class='s' style='background:"+sh.color+"'>"+sh.name+"</span>";h+=shiftDuration(sh.start,sh.end);}});
                    if(lvId){const lv=(company.leaves||[]).find(l=>l.id===lvId);if(lv)cell+="<i style='color:"+lv.color+";font-size:8px'>"+lv.short+"</i>";}
                    html+="<td>"+cell+"</td>";
                  }
                  html+="<td><b>"+formatHours(h)+"h</b></td></tr>";
                });
                html+="</table></body></html>";
                const w=window.open("","_blank","width=1200,height=800");
                if(w){w.document.write(html);w.document.close();w.focus();setTimeout(()=>w.print(),500);}
              }} style={{padding:"5px 10px",borderRadius:6,border:`1px solid ${th.bd}`,background:th.cellBg,
                cursor:"pointer",fontSize:10,fontWeight:600,color:th.t2,fontFamily:F,display:"flex",alignItems:"center",gap:4}}>
                <Icons.Printer s={12} c={th.t2}/> Print
              </button>
            </div>
            <div style={{fontSize:11,color:th.t3,fontWeight:500}}>
              {!selEmp?"👈 Selectează un angajat":!selShift&&!selLeave?"👈 Selectează tură / concediu":"✅ Apasă pe zilele din calendar"}
            </div>
          </div>

          {/* Schedule Grid */}
          <ScheduleCalendar
            company={company} month={curMonth} year={curYear}
            selectedShift={selShift} selectedEmp={selEmp} selectedLeave={selLeave}
            onAssign={assign} onRemove={removeAllFromDay}
            onAssignLeave={assignLeave} onRemoveLeave={removeLeaveFromDay}
            isAdmin={true} filterEmpId={null} th={th} t={t}
          />

          {/* ── Embedded KPI Glass Bar with animated counters + thresholds ── */}
          {company.employees.length>0&&(()=>{
            const totalWorked=Object.values(empMonthHoursDetail).reduce((s,d)=>s+d.total,0);
            const totalContracted=Object.values(empContractedHours).reduce((s,v)=>s+v,0);
            const totalOT=Object.values(empMonthHoursDetail).reduce((s,d)=>s+d.overtime,0);
            const totalHol=Object.values(empMonthHoursDetail).reduce((s,d)=>s+d.holiday,0);
            const util=totalContracted>0?Math.round(totalWorked/totalContracted*100):0;
            const kpis=[
              {v:`${util}%`,l:lang==="ro"?"Utilizare":"Utilization",c:util>100?th.warn:util>=90?th.ok:util>=70?th.warn:th.er,anchor:"dashboard-section"},
              {v:formatHours(totalOT)+"h",l:"OT",c:totalOT>0?th.warn:th.ok,anchor:"dashboard-section"},
              {v:formatHours(totalHol)+"h",l:lang==="ro"?"Sărbători":"Holidays",c:totalHol>0?"#d946ef":th.t3,anchor:"dashboard-section"},
              {v:String(company.employees.filter(e=>e.status!=="terminated").length),l:lang==="ro"?"Activi":"Active",c:th.ac,anchor:null},
            ];
            return <div style={{display:"flex",gap:8,marginTop:14,padding:"10px 12px",
              borderRadius:G.rS,background:th.gbg,border:`1px solid ${th.gbd}`,
              backdropFilter:G.blurS,WebkitBackdropFilter:G.blurS,
            }}>
              {kpis.map((kpi,i)=><div key={i}
                onClick={()=>{if(kpi.anchor){const el=document.getElementById(kpi.anchor);if(el)el.scrollIntoView({behavior:"smooth",block:"start"});}}}
                style={{flex:1,textAlign:"center",cursor:kpi.anchor?"pointer":"default",
                borderRight:i<3?`1px solid ${th.bd2}`:"none",paddingRight:i<3?8:0,
                transition:"transform 0.15s",borderRadius:6,padding:"4px 0",
              }}>
                <div style={{fontSize:18,fontWeight:800,color:kpi.c,lineHeight:1}}>{kpi.v}</div>
                <div style={{fontSize:9,color:th.t3,marginTop:2,fontWeight:600}}>{kpi.l}</div>
              </div>)}
            </div>;
          })()}

          {/* Legend */}
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:10,justifyContent:"center"}}>
            {company.shifts.map(s=><div key={s.id} style={{display:"flex",alignItems:"center",gap:3}}>
              <div style={{width:8,height:8,borderRadius:3,background:s.color}}/>
              <span style={{fontSize:9,color:th.t2}}>{s.name}</span>
            </div>)}
            <div style={{display:"flex",alignItems:"center",gap:3}}>
              <div style={{width:8,height:8,borderRadius:3,background:th.holBg,border:`1px solid ${th.holTx}40`}}/>
              <span style={{fontSize:9,color:th.holTx}}>{t.holiday}</span>
            </div>
          </div>
        </div>

        {/* ── Coverage Report with Mini Calendar Heatmap ── */}
        {company.employees.length>0 && company.shifts.length>0 && (()=>{
          const dayKeys=["mon","tue","wed","thu","fri","sat","sun"];
          const od=company.opDays||{mon:{active:true},tue:{active:true},wed:{active:true},thu:{active:true},fri:{active:true},sat:{active:false},sun:{active:false}};
          const monthNames=[t.jan,t.feb,t.mar,t.apr,t.may,t.jun,t.jul,t.aug,t.sep,t.oct,t.nov,t.dec];
          const daysInM=getDaysInMonth(curYear,curMonth);
          const firstDow=getFirstDayOfMonth(curYear,curMonth);
          const totalActive=company.employees.filter(e=>e.status!=="terminated").length;
          const dayCoverage=[];
          let uncoveredCount=0;
          for(let d=1;d<=daysInM;d++){
            const dow=(firstDow+d-1)%7;
            const isOp=od[dayKeys[dow]]?.active;
            const date=`${curYear}-${pad2(curMonth+1)}-${pad2(d)}`;
            const dayA=company.assignments[date]||{};
            const staffCount=Object.values(dayA).filter(v=>(Array.isArray(v)?v.length>0:!!v)).length;
            const pct=totalActive>0?Math.round(staffCount/totalActive*100):0;
            if(isOp&&staffCount===0) uncoveredCount++;
            dayCoverage.push({d,dow,isOp,staffCount,pct,date});
          }
          const dayH=[t.mon,t.tue,t.wed,t.thu,t.fri,t.sat,t.sun];
          const calCells=[];
          for(let i=0;i<firstDow;i++) calCells.push(null);
          dayCoverage.forEach(dc=>calCells.push(dc));
          while(calCells.length%7!==0) calCells.push(null);

          return <div id="coverage-section" style={{borderRadius:G.rL,background:th.card,border:`1px solid ${th.gbd}`,
            boxShadow:th.cardS,backdropFilter:G.blur,WebkitBackdropFilter:G.blur,padding:16}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <h3 style={{fontSize:14,fontWeight:800,color:th.tx,margin:0}}>📊 {t.coverageReport}</h3>
              <span style={{fontSize:11,color:th.t3}}>{monthNames[curMonth]} {curYear}</span>
            </div>
            {uncoveredCount===0?<div style={{
              padding:"10px 14px",borderRadius:G.rXs,background:th.okBg,display:"flex",alignItems:"center",gap:8,
            }}><Icons.Check s={16} c={th.ok}/><span style={{fontSize:12,fontWeight:600,color:th.ok}}>{t.noneUncovered}</span></div>
            :<div style={{fontSize:12,fontWeight:600,color:th.warn,marginBottom:8}}>⚠️ {uncoveredCount} {t.uncoveredDays.toLowerCase()}</div>}
            {/* Mini calendar heatmap */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginTop:8}}>
              {dayH.map((dn,i)=><div key={i} style={{textAlign:"center",fontSize:8,fontWeight:700,color:th.t3,padding:"2px 0"}}>{dn}</div>)}
              {calCells.map((cell,i)=>{
                if(!cell) return <div key={"e"+i} style={{minHeight:28}}/>;
                const bg=!cell.isOp?th.t3+"08":cell.pct>=80?th.ok+"20":cell.pct>=40?th.warn+"20":cell.staffCount===0?th.er+"15":"transparent";
                const border=!cell.isOp?"none":cell.pct>=80?`1px solid ${th.ok}30`:cell.pct>=40?`1px solid ${th.warn}30`:cell.staffCount===0?`1px solid ${th.er}25`:`1px solid ${th.bd2}`;
                return <div key={cell.d} title={`${cell.d}: ${cell.staffCount}/${totalActive} (${cell.pct}%)`} style={{
                  minHeight:28,borderRadius:4,background:bg,border,
                  display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                  cursor:"default",transition:"all 0.1s",
                }}>
                  <span style={{fontSize:10,fontWeight:600,color:!cell.isOp?th.t3:th.tx}}>{cell.d}</span>
                  {cell.isOp&&<span style={{fontSize:7,fontWeight:600,
                    color:cell.pct>=80?th.ok:cell.pct>=40?th.warn:cell.staffCount===0?th.er:th.t3,
                  }}>{cell.staffCount}/{totalActive}</span>}
                </div>;
              })}
            </div>
            {/* Legend */}
            <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:8,flexWrap:"wrap"}}>
              {[{c:th.ok+"20",b:th.ok+"30",l:lang==="ro"?"Acoperit (80%+)":"Covered (80%+)"},
                {c:th.warn+"20",b:th.warn+"30",l:lang==="ro"?"Parțial":"Partial"},
                {c:th.er+"15",b:th.er+"25",l:lang==="ro"?"Neacoperit":"Uncovered"},
                {c:th.t3+"08",b:"transparent",l:lang==="ro"?"Închis":"Closed"},
              ].map(({c:co,b:bo,l},i)=><span key={i} style={{display:"flex",alignItems:"center",gap:3,fontSize:8,color:th.t2}}>
                <div style={{width:10,height:10,borderRadius:2,background:co,border:`1px solid ${bo}`}}/>{l}
              </span>)}
            </div>
          </div>;
        })()}


        {/* ── COMPLIANCE & ANALYTICS DASHBOARD ── */}
        {company.employees.length>0 && (()=>{
          const dayKeys=["mon","tue","wed","thu","fri","sat","sun"];
          const od=company.opDays||{mon:{active:true},tue:{active:true},wed:{active:true},thu:{active:true},fri:{active:true},sat:{active:false},sun:{active:false}};
          const daysInM=getDaysInMonth(curYear,curMonth);
          const monthNames=[t.jan,t.feb,t.mar,t.apr,t.may,t.jun,t.jul,t.aug,t.sep,t.oct,t.nov,t.dec];
          const hols=holidays;
          const compliance=company.employees.filter(e=>e.status!=="terminated").map(emp=>{
            const warnings=[];
            const workDays=[];
            for(let d=1;d<=daysInM;d++){
              const date=`${curYear}-${pad2(curMonth+1)}-${pad2(d)}`;
              const dow=(getFirstDayOfMonth(curYear,curMonth)+d-1)%7;
              const dayA=company.assignments[date]||{};
              const raw=dayA[emp.id];
              const shiftIds=raw?(Array.isArray(raw)?raw:[raw]):[];
              const shifts=shiftIds.map(id=>company.shifts.find(s=>s.id===id)).filter(Boolean);
              const totalH=shifts.reduce((s,sh)=>s+shiftDuration(sh.start,sh.end),0);
              const isHol=!!hols[date];
              const la=(company.leaveAssignments||{})[date]||{};
              const hasLeave=!!la[emp.id];
              workDays.push({d,date,dow,totalH,isHol,hasLeave,worked:totalH>0});
            }
            for(let i=0;i<=daysInM-7;i++){
              const week=workDays.slice(i,i+7);
              let maxConsecRest=0,curConsec=0;
              for(const day of week){if(!day.worked)curConsec++;else{maxConsecRest=Math.max(maxConsecRest,curConsec);curConsec=0;}}
              maxConsecRest=Math.max(maxConsecRest,curConsec);
              if(maxConsecRest<2&&week.filter(d=>d.worked).length>=6)
                warnings.push({type:"rest48",severity:"high",msg:lang==="ro"?`Săpt. ${week[0].d}–${week[6].d}: lipsă repaus 48h (Art. 137)`:`Week ${week[0].d}–${week[6].d}: missing 48h rest (Art. 137)`});
              const weekH=week.reduce((s,d)=>s+d.totalH,0);
              if(weekH>48) warnings.push({type:"max48",severity:"high",msg:lang==="ro"?`Săpt. ${week[0].d}–${week[6].d}: ${formatHours(weekH)}h (max 48h, Art. 114)`:`Week ${week[0].d}–${week[6].d}: ${formatHours(weekH)}h (max 48h, Art. 114)`});
            }
            let maxCW=0,curCW=0;
            for(const day of workDays){if(day.worked){curCW++;maxCW=Math.max(maxCW,curCW)}else curCW=0;}
            if(maxCW>14) warnings.push({type:"consec14",severity:"high",msg:lang==="ro"?`${maxCW} zile consecutive (max 14, Art. 137)`:`${maxCW} consecutive days (max 14, Art. 137)`});
            const holDays=workDays.filter(d=>d.isHol&&d.worked);
            if(holDays.length>0) warnings.push({type:"holiday",severity:"info",msg:lang==="ro"?`${holDays.length} zile sărbători lucrate (spor ≥100%)`:`${holDays.length} holiday days worked (≥100% premium)`});
            const detail=empMonthHoursDetail[emp.id]||{normal:0,overtime:0,holiday:0,total:0};
            const contracted=empContractedHours[emp.id]||0;
            const leaveDays=workDays.filter(d=>d.hasLeave).length;
            const absentDays=workDays.filter(d=>{const isOp=od[dayKeys[d.dow]]?.active;return isOp&&!d.worked&&!d.hasLeave&&!d.isHol;}).length;
            return {emp,warnings,detail,contracted,leaveDays,absentDays};
          });

          return <div id="dashboard-section" style={{borderRadius:G.rL,background:th.card,border:`1px solid ${th.gbd}`,
            boxShadow:th.cardS,backdropFilter:G.blur,WebkitBackdropFilter:G.blur,padding:16}}>
            <h2 style={{fontSize:16,fontWeight:900,color:th.tx,marginBottom:14}}>📊 Dashboard — {monthNames[curMonth]} {curYear}</h2>

            {/* Sortable Compliance Table with row hover + expandable detail */}
            <div style={{overflowX:"auto",marginBottom:16}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,fontFamily:F}}>
                <thead><tr style={{background:th.bd2}}>
                  <th style={{padding:"8px 10px",textAlign:"left",fontWeight:700,color:th.t2}}>{lang==="ro"?"Angajat":"Employee"}</th>
                  <th style={{padding:"8px 6px",textAlign:"center",fontWeight:700,color:th.t2,cursor:"pointer"}}>{lang==="ro"?"Ore":"Hours"}</th>
                  <th style={{padding:"8px 6px",textAlign:"center",fontWeight:700,color:th.t2}}>OT</th>
                  <th style={{padding:"8px 6px",textAlign:"center",fontWeight:700,color:th.t2}}>{lang==="ro"?"Sărbători":"Holidays"}</th>
                  <th style={{padding:"8px 6px",textAlign:"center",fontWeight:700,color:th.t2}}>{lang==="ro"?"Concedii":"Leaves"}</th>
                  <th style={{padding:"8px 6px",textAlign:"center",fontWeight:700,color:th.t2}}>{lang==="ro"?"Absențe":"Absences"}</th>
                  <th style={{padding:"8px 10px",textAlign:"left",fontWeight:700,color:th.t2}}>Status</th>
                </tr></thead>
                <tbody>{compliance.map(({emp,warnings,detail,contracted,leaveDays,absentDays})=>{
                  const highW=warnings.filter(w=>w.severity==="high");
                  const utilPct=contracted>0?Math.round(detail.total/contracted*100):0;
                  const statusColor=highW.length>0?th.er:utilPct>105?th.warn:th.ok;
                  const statusLabel=highW.length>0?(lang==="ro"?"Neconform":"Non-compliant"):utilPct>105?(lang==="ro"?"Atenție":"Warning"):(lang==="ro"?"Conform":"Compliant");
                  const statusIcon=highW.length>0?"❌":utilPct>105?"⚠️":"✅";
                  return <tr key={emp.id} style={{borderBottom:`1px solid ${th.bd2}`,transition:"background 0.1s",cursor:"default"}}
                    onMouseEnter={e=>e.currentTarget.style.background=th.ac+"08"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{padding:"8px 10px",fontWeight:600,color:th.tx}}>{emp.name}</td>
                    <td style={{padding:"8px 6px",textAlign:"center",color:th.t2}}>{formatHours(detail.total)}h/{formatHours(contracted)}h</td>
                    <td style={{padding:"8px 6px",textAlign:"center",color:detail.overtime>0?th.warn:th.t3,fontWeight:detail.overtime>0?700:400}}>{detail.overtime>0?formatHours(detail.overtime)+"h":"–"}</td>
                    <td style={{padding:"8px 6px",textAlign:"center",color:detail.holiday>0?"#d946ef":th.t3}}>{detail.holiday>0?formatHours(detail.holiday)+"h":"–"}</td>
                    <td style={{padding:"8px 6px",textAlign:"center",color:leaveDays>0?PAL.blue:th.t3}}>{leaveDays||"–"}</td>
                    <td style={{padding:"8px 6px",textAlign:"center",color:absentDays>0?th.er:th.t3,fontWeight:absentDays>0?700:400}}>{absentDays||"–"}</td>
                    <td style={{padding:"8px 10px"}}><span style={{
                      fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:8,
                      background:statusColor+"15",color:statusColor,
                    }}>{statusIcon} {statusLabel}</span>
                    {highW.length>0&&<div style={{marginTop:3}}>{highW.map((w,i)=><div key={i} style={{fontSize:8,color:th.er,fontWeight:600}}>⚠️ {w.msg}</div>)}</div>}
                    </td>
                  </tr>;
                })}</tbody>
              </table>
            </div>

            {/* Hours Bar Chart with target line + tooltip */}
            <h3 style={{fontSize:13,fontWeight:800,color:th.tx,marginBottom:10}}>📈 {lang==="ro"?"Repartizare Ore":"Hours Distribution"}</h3>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
              {compliance.map(({emp,detail,contracted})=>{
                const maxH=Math.max(...compliance.map(c=>Math.max(c.detail.total,c.contracted)),1);
                const nW=(detail.normal/maxH*100);const oW=(detail.overtime/maxH*100);const hW=(detail.holiday/maxH*100);
                const targetPos=contracted/maxH*100;
                return <div key={emp.id} style={{display:"flex",alignItems:"center",gap:8}}
                  title={`${emp.name}: ${formatHours(detail.normal)}h ${lang==="ro"?"normale":"normal"} + ${formatHours(detail.overtime)}h OT + ${formatHours(detail.holiday)}h ${lang==="ro"?"sărbători":"holidays"} = ${formatHours(detail.total)}h`}>
                  <span style={{fontSize:10,fontWeight:600,color:th.tx,width:70,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flexShrink:0}}>{emp.name}</span>
                  <div style={{flex:1,height:16,borderRadius:4,background:th.bd2,position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${nW}%`,background:th.ok,borderRadius:"4px 0 0 4px"}}/>
                    <div style={{position:"absolute",left:`${nW}%`,top:0,height:"100%",width:`${oW}%`,background:th.warn}}/>
                    <div style={{position:"absolute",left:`${nW+oW}%`,top:0,height:"100%",width:`${hW}%`,background:"#d946ef",borderRadius:"0 4px 4px 0"}}/>
                    {/* Target line */}
                    <div style={{position:"absolute",left:`${targetPos}%`,top:-2,height:20,width:2,
                      background:th.tx,borderRadius:1,opacity:0.4}} title={`${lang==="ro"?"Contract":"Contract"}: ${formatHours(contracted)}h`}/>
                  </div>
                  <span style={{fontSize:9,color:th.t3,width:40,textAlign:"right",flexShrink:0}}>{formatHours(detail.total)}h</span>
                </div>;
              })}
              <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:4,flexWrap:"wrap"}}>
                {[{c:th.ok,l:lang==="ro"?"Normale":"Normal"},{c:th.warn,l:lang==="ro"?"Suplimentare":"Overtime"},{c:"#d946ef",l:lang==="ro"?"Sărbători":"Holidays"},{c:th.tx+"50",l:lang==="ro"?"Contract":"Contract",isDashed:true}].map(({c:co,l,isDashed},i)=>
                  <span key={i} style={{display:"flex",alignItems:"center",gap:3,fontSize:9,color:th.t2}}>
                    <div style={{width:isDashed?2:8,height:8,borderRadius:isDashed?0:2,background:co}}/>{l}
                  </span>)}
              </div>
            </div>

            {/* ── IMPROVEMENT 19: Leave Balance Tracker ── */}
            {(()=>{
              const coLeave=(company.leaves||[]).find(lv=>lv.short==="CO");
              if(!coLeave) return null;
              const activeEmps=company.employees.filter(e=>e.status!=="terminated");
              if(activeEmps.length===0) return null;
              const leaveBalances=activeEmps.map(emp=>{
                const annual=emp.ptoDays||21;
                let used=0;
                Object.entries(company.leaveAssignments||{}).forEach(([date,la])=>{
                  if(la[emp.id]===coLeave.id) used++;
                });
                return {emp,annual,used,remaining:Math.max(0,annual-used)};
              });
              return <div style={{marginBottom:14}}>
                <h3 style={{fontSize:13,fontWeight:800,color:th.tx,marginBottom:10}}>🏖️ {lang==="ro"?"Sold Concediu Odihnă (CO)":"PTO Balance (Annual Leave)"}</h3>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:6}}>
                  {leaveBalances.map(({emp,annual,used,remaining})=>{
                    const pct=annual>0?Math.round(used/annual*100):0;
                    return <div key={emp.id} style={{padding:"8px 10px",borderRadius:G.rXs,
                      background:th.gbg,border:`1px solid ${th.gbd}`,
                    }}>
                      <div style={{fontSize:10,fontWeight:700,color:th.tx,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{emp.name}</div>
                      <div style={{height:4,borderRadius:2,background:th.bd2,overflow:"hidden",marginBottom:4}}>
                        <div style={{height:"100%",width:`${pct}%`,borderRadius:2,
                          background:pct>=90?th.er:pct>=70?th.warn:th.ok,transition:"width 0.3s"}}/>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:8}}>
                        <span style={{color:th.t3}}>{used}/{annual} {lang==="ro"?"folosite":"used"}</span>
                        <span style={{fontWeight:700,color:remaining<=3?th.er:remaining<=7?th.warn:th.ok}}>{remaining} {lang==="ro"?"rămase":"left"}</span>
                      </div>
                    </div>;
                  })}
                </div>
              </div>;
            })()}

            {/* ── IMPROVEMENT 20: Monthly Comparison ── */}
            {(()=>{
              const prevM=curMonth===0?11:curMonth-1;
              const prevY=curMonth===0?curYear-1:curYear;
              const prevHols=getHolidays(company.country,prevY);
              const prevDaysInM=getDaysInMonth(prevY,prevM);
              let prevTotalWorked=0,prevTotalOT=0,prevTotalHol=0;
              let prevTotalContracted=0;
              company.employees.filter(e=>e.status!=="terminated").forEach(emp=>{
                const hpd=emp.hoursPerDay||8;
                let legalDays=0;
                for(let d=1;d<=prevDaysInM;d++){
                  const dow=(getFirstDayOfMonth(prevY,prevM)+d-1)%7;
                  const date=`${prevY}-${pad2(prevM+1)}-${pad2(d)}`;
                  if(dow<=4&&!prevHols[date]) legalDays++;
                }
                prevTotalContracted+=legalDays*hpd;
                for(let d=1;d<=prevDaysInM;d++){
                  const date=`${prevY}-${pad2(prevM+1)}-${pad2(d)}`;
                  const dayA=company.assignments[date]||{};
                  const raw=dayA[emp.id];
                  const ids=raw?(Array.isArray(raw)?raw:[raw]):[];
                  const shifts=ids.map(id=>company.shifts.find(s=>s.id===id)).filter(Boolean);
                  const h=shifts.reduce((s,sh)=>s+shiftDuration(sh.start,sh.end),0);
                  const isHol=!!prevHols[date];
                  if(isHol&&h>0) prevTotalHol+=h;
                  else prevTotalWorked+=h;
                }
              });
              prevTotalOT=Math.max(0,prevTotalWorked-prevTotalContracted);
              const curTotalWorked=Object.values(empMonthHoursDetail).reduce((s,d)=>s+d.total,0);
              const curTotalOT=Object.values(empMonthHoursDetail).reduce((s,d)=>s+d.overtime,0);
              const curTotalHol=Object.values(empMonthHoursDetail).reduce((s,d)=>s+d.holiday,0);
              const curTotalContracted=Object.values(empContractedHours).reduce((s,v)=>s+v,0);
              const curUtil=curTotalContracted>0?Math.round(curTotalWorked/curTotalContracted*100):0;
              const prevUtil=prevTotalContracted>0?Math.round((prevTotalWorked+prevTotalHol)/prevTotalContracted*100):0;
              const delta=(v1,v2)=>{const d=v1-v2;return d>0?`+${d}`:d<0?`${d}`:"=";};
              const deltaC=(v1,v2)=>{const d=v1-v2;return d>0?th.ok:d<0?th.er:th.t3;};
              return <div>
                <h3 style={{fontSize:13,fontWeight:800,color:th.tx,marginBottom:10}}>📅 {lang==="ro"?"Comparație lunară":"Monthly Comparison"}</h3>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
                  {[
                    {l:lang==="ro"?"Utilizare":"Utilization",cur:`${curUtil}%`,prev:`${prevUtil}%`,d:delta(curUtil,prevUtil)+"%",dc:deltaC(curUtil,prevUtil)},
                    {l:"OT",cur:formatHours(curTotalOT)+"h",prev:formatHours(prevTotalOT)+"h",d:delta(Math.round(curTotalOT),Math.round(prevTotalOT))+"h",dc:curTotalOT>prevTotalOT?th.warn:th.ok},
                    {l:lang==="ro"?"Sărbători":"Holidays",cur:formatHours(curTotalHol)+"h",prev:formatHours(prevTotalHol)+"h",d:delta(Math.round(curTotalHol),Math.round(prevTotalHol))+"h",dc:th.t3},
                    {l:lang==="ro"?"Ore lucrate":"Hours worked",cur:formatHours(curTotalWorked)+"h",prev:formatHours(prevTotalWorked+prevTotalHol)+"h",d:delta(Math.round(curTotalWorked),Math.round(prevTotalWorked+prevTotalHol))+"h",dc:deltaC(curTotalWorked,prevTotalWorked+prevTotalHol)},
                  ].map((m,i)=><div key={i} style={{padding:"8px",borderRadius:G.rXs,background:th.gbg,border:`1px solid ${th.gbd}`,textAlign:"center"}}>
                    <div style={{fontSize:8,fontWeight:600,color:th.t3,marginBottom:4}}>{m.l}</div>
                    <div style={{fontSize:14,fontWeight:800,color:th.tx,lineHeight:1}}>{m.cur}</div>
                    <div style={{fontSize:8,color:m.dc,fontWeight:700,marginTop:3}}>{m.d} {lang==="ro"?"vs":"vs"} {monthNames[prevM].slice(0,3)}</div>
                  </div>)}
                </div>
              </div>;
            })()}
          </div>;
        })()}

      </main>
    </div>

    {/* ADD EMPLOYEE MODAL */}
    <Modal open={showAddEmp} onClose={()=>setShowAddEmp(false)} title={t.addEmployee} th={th}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div>
          <label style={{fontSize:12,fontWeight:700,color:th.t2,display:"block",marginBottom:6}}>{t.empName}</label>
          <GInput th={th} value={newEmpName} onChange={e=>setNewEmpName(e.target.value)} placeholder="John Doe"
            onKeyDown={e=>e.key==="Enter"&&addEmployee()}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          <div>
            <label style={{fontSize:12,fontWeight:700,color:th.t2,display:"block",marginBottom:6}}>{t.empRole}</label>
            <GInput th={th} value={newEmpRole} onChange={e=>setNewEmpRole(e.target.value)} placeholder="Barista, Server..."/>
          </div>
          <div>
            <label style={{fontSize:12,fontWeight:700,color:th.t2,display:"block",marginBottom:6}}>{t.empHours}</label>
            <GInput th={th} type="number" min={1} max={24} value={newEmpHours} onChange={e=>setNewEmpHours(e.target.value)} placeholder="8"/>
          </div>
          <div>
            <label style={{fontSize:12,fontWeight:700,color:th.t2,display:"block",marginBottom:6}}>{t.ptoDays}</label>
            <GInput th={th} type="number" min={0} max={365} value={newEmpPTO} onChange={e=>setNewEmpPTO(e.target.value)} placeholder="21"/>
          </div>
        </div>
        <div>
          <label style={{fontSize:12,fontWeight:700,color:th.t2,display:"block",marginBottom:6}}>{t.startDate}</label>
          <GInput th={th} type="date" value={newEmpStartDate} onChange={e=>setNewEmpStartDate(e.target.value)}/>
        </div>
        <GBtn primary th={th} onClick={addEmployee} disabled={!newEmpName.trim()}>
          <Icons.Plus s={14} c="#fff"/> {t.save}
        </GBtn>
      </div>
    </Modal>

    {/* EDIT EMPLOYEE MODAL */}
    <Modal open={showEditEmp} onClose={()=>{setShowEditEmp(false);setEditingEmp(null)}} title={t.edit+" "+t.employees.toLowerCase()} th={th}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div>
          <label style={{fontSize:12,fontWeight:700,color:th.t2,display:"block",marginBottom:6}}>{t.empName}</label>
          <GInput th={th} value={editEmpName} onChange={e=>setEditEmpName(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&saveEditEmp()}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          <div>
            <label style={{fontSize:12,fontWeight:700,color:th.t2,display:"block",marginBottom:6}}>{t.empRole}</label>
            <GInput th={th} value={editEmpRole} onChange={e=>setEditEmpRole(e.target.value)} placeholder="Barista, Server..."/>
          </div>
          <div>
            <label style={{fontSize:12,fontWeight:700,color:th.t2,display:"block",marginBottom:6}}>{t.empHours}</label>
            <GInput th={th} type="number" min={1} max={24} value={editEmpHours} onChange={e=>setEditEmpHours(e.target.value)}/>
          </div>
          <div>
            <label style={{fontSize:12,fontWeight:700,color:th.t2,display:"block",marginBottom:6}}>{t.ptoDays}</label>
            <GInput th={th} type="number" min={0} max={365} value={editEmpPTO} onChange={e=>setEditEmpPTO(e.target.value)} placeholder="21"/>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>
            <label style={{fontSize:12,fontWeight:700,color:th.t2,display:"block",marginBottom:6}}>{t.startDate}</label>
            <GInput th={th} type="date" value={editEmpStartDate} onChange={e=>setEditEmpStartDate(e.target.value)}/>
          </div>
          <div>
            <label style={{fontSize:12,fontWeight:700,color:th.t2,display:"block",marginBottom:6}}>{t.endDate}</label>
            <GInput th={th} type="date" value={editEmpEndDate} onChange={e=>setEditEmpEndDate(e.target.value)}/>
            {editEmpEndDate&&<span style={{fontSize:10,color:th.er,fontWeight:600,marginTop:2,display:"block"}}>⚠️ {t.terminated}</span>}
          </div>
        </div>
        {/* Status indicator */}
        {(()=>{
          const emp=company.employees.find(e=>e.id===editingEmp);
          if(!emp)return null;
          const isTerminated=emp.endDate||editEmpEndDate;
          return <div style={{
            padding:"8px 12px",borderRadius:G.rXs,
            background:isTerminated?th.erBg:th.okBg,
            display:"flex",alignItems:"center",justifyContent:"space-between",
          }}>
            <span style={{fontSize:12,fontWeight:700,color:isTerminated?th.er:th.ok}}>
              {isTerminated?"⛔ "+t.terminated:"✅ "+t.active}
              {emp.startDate&&<span style={{fontWeight:400,color:th.t3,marginLeft:8}}>din {emp.startDate}</span>}
              {isTerminated&&<span style={{fontWeight:400,color:th.t3,marginLeft:8}}>până {editEmpEndDate||emp.endDate}</span>}
            </span>
          </div>;
        })()}
        <div style={{display:"flex",gap:8}}>
          <GBtn primary th={th} onClick={saveEditEmp} disabled={!editEmpName.trim()} style={{flex:1}}>
            <Icons.Check s={14} c="#fff"/> {t.save}
          </GBtn>
          {!editEmpEndDate&&<GBtn danger th={th} onClick={()=>setShowTerminate(true)}>
            ⛔ {t.terminateEmp}
          </GBtn>}
          <GBtn danger th={th} onClick={()=>{deleteEmployee(editingEmp);setShowEditEmp(false);setEditingEmp(null);}}>
            <Icons.Trash s={14}/> {t.delete}
          </GBtn>
        </div>
        {/* Terminate confirmation */}
        {showTerminate&&<div style={{padding:12,borderRadius:G.rXs,border:`1px solid ${th.er}40`,background:th.erBg}}>
          <p style={{fontSize:12,fontWeight:600,color:th.er,margin:"0 0 8px"}}>
            {t.terminateConfirm} {editEmpName}?
          </p>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <GInput th={th} type="date" value={terminateDate} onChange={e=>setTerminateDate(e.target.value)}
              style={{flex:1}}/>
            <GBtn danger th={th} onClick={()=>{
              if(terminateDate){
                setEditEmpEndDate(terminateDate);
                terminateEmployee(editingEmp,terminateDate);
                setShowEditEmp(false);setEditingEmp(null);
              }
            }} disabled={!terminateDate}>
              Confirmă
            </GBtn>
            <GBtn th={th} small onClick={()=>setShowTerminate(false)}>
              {t.cancel}
            </GBtn>
          </div>
        </div>}
      </div>
    </Modal>

    {/* ADD SHIFT MODAL */}
    <Modal open={showAddShift} onClose={()=>setShowAddShift(false)} title={t.addShift} th={th}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div>
          <label style={{fontSize:12,fontWeight:700,color:th.t2,display:"block",marginBottom:6}}>{t.shiftName}</label>
          <GInput th={th} value={newShiftName} onChange={e=>setNewShiftName(e.target.value)} placeholder="Morning Shift"/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>
            <label style={{fontSize:12,fontWeight:700,color:th.t2,display:"block",marginBottom:6}}>{t.startTime}</label>
            <GInput th={th} type="time" value={newShiftStart} onChange={e=>setNewShiftStart(e.target.value)}/>
          </div>
          <div>
            <label style={{fontSize:12,fontWeight:700,color:th.t2,display:"block",marginBottom:6}}>{t.endTime}</label>
            <GInput th={th} type="time" value={newShiftEnd} onChange={e=>setNewShiftEnd(e.target.value)}/>
          </div>
        </div>
        <div style={{fontSize:12,color:th.t3,textAlign:"center"}}>
          Duration: {formatHours(shiftDuration(newShiftStart,newShiftEnd))} {t.hours}
        </div>
        <GBtn primary th={th} onClick={addShift} disabled={!newShiftName.trim()}>
          <Icons.Plus s={14} c="#fff"/> {t.save}
        </GBtn>
      </div>
    </Modal>


    {/* ADD LEAVE MODAL */}
    <Modal open={showAddLeave} onClose={()=>setShowAddLeave(false)} title={t.addLeave} th={th}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div>
          <label style={{fontSize:12,fontWeight:700,color:th.t2,display:"block",marginBottom:6}}>{t.leaveName}</label>
          <GSelect th={th} value={newLeaveName} onChange={e=>{
            const sel=DEFAULT_LEAVES.find(l=>l.name===e.target.value);
            setNewLeaveName(e.target.value);
            if(sel)setNewLeaveShort(sel.short);
          }}>
            <option value="">— Selectează tip concediu —</option>
            {DEFAULT_LEAVES.filter(dl=>!(company.leaves||[]).find(l=>l.name===dl.name)).map(dl=>
              <option key={dl.id} value={dl.name}>{dl.name} ({dl.short})</option>
            )}
          </GSelect>
        </div>
        <div>
          <label style={{fontSize:12,fontWeight:700,color:th.t2,display:"block",marginBottom:6}}>Sau tip personalizat</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 80px",gap:8}}>
            <GInput th={th} value={newLeaveName} onChange={e=>{setNewLeaveName(e.target.value);setNewLeaveShort(e.target.value.slice(0,3).toUpperCase())}} placeholder="Nume concediu..."/>
            <GInput th={th} value={newLeaveShort} onChange={e=>setNewLeaveShort(e.target.value)} placeholder="ABR" maxLength={4}/>
          </div>
        </div>
        <GBtn primary th={th} onClick={addLeave} disabled={!newLeaveName.trim()}>
          <Icons.Plus s={14} c="#fff"/> {t.save}
        </GBtn>
      </div>
    </Modal>

    {/* LEAVE LEGEND MODAL */}
    <Modal open={showLeaveLegend} onClose={()=>setShowLeaveLegend(false)} title="Legendă Concedii" th={th}>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {(company.leaves||[]).map(lv=><div key={lv.id} style={{
          display:"flex",alignItems:"center",gap:10,padding:"8px 10px",
          borderRadius:G.rXs,background:lv.color+"10",border:`1px solid ${lv.color}25`,
        }}>
          <div style={{width:14,height:14,borderRadius:5,background:lv.color,flexShrink:0,
            boxShadow:`0 0 6px ${lv.color}40`}}/>
          <span style={{fontSize:13,fontWeight:800,color:lv.color,width:44,flexShrink:0}}>{lv.short}</span>
          <span style={{fontSize:13,color:th.tx,flex:1}}>{lv.name}</span>
        </div>)}
      </div>
    </Modal>

    {/* ADMIN SETTINGS MODAL */}
    <Modal open={showAdminSettings} onClose={()=>setShowAdminSettings(false)} title={t.adminSettings} th={th} wide>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div>
          <label style={{fontSize:12,fontWeight:700,color:th.t2,display:"block",marginBottom:6}}>{t.companyName}</label>
          <GInput th={th} value={editCompanyName} onChange={e=>setEditCompanyName(e.target.value)}/>
        </div>
        <div>
          <label style={{fontSize:12,fontWeight:700,color:th.t2,display:"block",marginBottom:6}}>{t.country}</label>
          <div style={{padding:"10px 14px",borderRadius:G.rXs,border:`1px solid ${th.inputBd}`,
            background:th.inputBg,fontSize:14,fontFamily:F,color:th.tx,display:"flex",alignItems:"center",gap:8}}>
            <span>🇷🇴</span> România
          </div>
        </div>
        <div>
          <label style={{fontSize:12,fontWeight:700,color:th.t2,display:"block",marginBottom:6}}>{t.operatingDays}</label>
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            {["mon","tue","wed","thu","fri","sat","sun"].map(day=>{
              const dayLabels={mon:t.monFull,tue:t.tueFull,wed:t.wedFull,thu:t.thuFull,fri:t.friFull,sat:t.satFull||"Sâmbătă",sun:t.sunFull||"Duminică"};
              const cfg=editOpDays[day]||{active:false,start:"09:00",end:"17:00"};
              return <div key={day} style={{
                display:"flex",alignItems:"center",gap:8,padding:"6px 10px",
                borderRadius:G.rXs,border:`1px solid ${cfg.active?th.ac+"30":th.bd2}`,
                background:cfg.active?th.acS+"30":"transparent",
              }}>
                <button onClick={()=>toggleEditDay(day)} style={{
                  width:36,height:20,borderRadius:10,border:"none",cursor:"pointer",position:"relative",
                  background:cfg.active?th.ac:th.t3+"50",transition:"background 0.2s",flexShrink:0,
                }}>
                  <div style={{width:16,height:16,borderRadius:8,background:"#fff",
                    position:"absolute",top:2,left:cfg.active?18:2,transition:"left 0.2s",
                    boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/>
                </button>
                <span style={{fontSize:12,fontWeight:700,color:cfg.active?th.tx:th.t3,minWidth:80}}>{dayLabels[day]}</span>
                {cfg.active?<div style={{display:"flex",alignItems:"center",gap:4,flex:1}}>
                  <GInput th={th} type="time" value={cfg.start} onChange={e=>setEditDayTime(day,"start",e.target.value)}
                    style={{padding:"4px 6px",fontSize:11,flex:1,minWidth:0}}/>
                  <span style={{fontSize:11,color:th.t3}}>–</span>
                  <GInput th={th} type="time" value={cfg.end} onChange={e=>setEditDayTime(day,"end",e.target.value)}
                    style={{padding:"4px 6px",fontSize:11,flex:1,minWidth:0}}/>
                </div>:<span style={{fontSize:11,color:th.t3,fontStyle:"italic"}}>{t.closed}</span>}
              </div>;
            })}
          </div>
        </div>
        <GBtn primary th={th} onClick={saveAdminSettings} style={{marginTop:4}}>
          <Icons.Check s={14} c="#fff"/> {t.save}
        </GBtn>
      </div>
    </Modal>

        {/* SHARE MODAL */}
    <Modal open={showShare} onClose={()=>setShowShare(false)} title={t.shareLink} th={th} wide>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {/* Admin link */}
        <GCard th={th} style={{padding:16}}>
          <div style={{fontSize:12,fontWeight:700,color:th.t2,marginBottom:6}}>🔑 {t.adminLink}</div>
          <div style={{display:"flex",gap:8}}>
            <GInput th={th} value={adminUrl} readOnly style={{fontSize:11}}/>
            <GBtn small primary th={th} onClick={()=>copyToClipboard(adminUrl)}>
              {copied?<Icons.Check s={12} c="#fff"/>:<Icons.Copy s={12} c="#fff"/>}
            </GBtn>
          </div>
        </GCard>
        {/* Member links */}
        <div style={{fontSize:12,fontWeight:700,color:th.t2,marginBottom:4}}>👥 {t.memberLink}s</div>
        {company.employees.map(emp=><div key={emp.id} style={{
          display:"flex",gap:8,alignItems:"center",marginBottom:4,
        }}>
          <span style={{fontSize:12,fontWeight:600,color:th.tx,minWidth:100}}>{emp.name}</span>
          <GInput th={th} value={memberUrl(emp.id)} readOnly style={{fontSize:10,flex:1}}/>
          <GBtn small th={th} onClick={()=>copyToClipboard(memberUrl(emp.id))}>
            <Icons.Copy s={12} c={th.tx}/>
          </GBtn>
        </div>)}
        {company.employees.length===0&&<p style={{fontSize:12,color:th.t3}}>{t.noEmployees}</p>}
      </div>
    </Modal>

    {toast&&<Toast msg={toast.msg} type={toast.type} th={th}/>}
  </div>;
}

// ─── MEMBER VIEW (READ-ONLY) ─────────────────────────────────
function MemberView({company,empId,th,t,lang,setLang,theme,setTheme}){
  const emp=company.employees.find(e=>e.id===empId);
  const [curMonth,setCurMonth]=useState(new Date().getMonth());
  const [curYear,setCurYear]=useState(new Date().getFullYear());

  if(!emp) return <div style={{minHeight:"100vh",background:th.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F}}>
    <GCard th={th} style={{padding:32,textAlign:"center"}}>
      <div style={{fontSize:48,marginBottom:16}}>🔍</div>
      <p style={{fontSize:16,color:th.tx,fontWeight:700}}>Employee not found</p>
    </GCard>
  </div>;

  const now=new Date();
  const maxDate=new Date(now.getFullYear(),now.getMonth()+MAX_MONTHS_AHEAD,1);
  const canPrev=()=>(new Date(curYear,curMonth,1)>new Date(2026,0,1));
  const canNext=()=>(new Date(curYear,curMonth+1,1)<=maxDate);
  const goPrev=()=>{if(canPrev()){if(curMonth===0){setCurMonth(11);setCurYear(curYear-1)}else setCurMonth(curMonth-1)}};
  const goNext=()=>{if(canNext()){if(curMonth===11){setCurMonth(0);setCurYear(curYear+1)}else setCurMonth(curMonth+1)}};

  const monthNames=[t.jan,t.feb,t.mar,t.apr,t.may,t.jun,t.jul,t.aug,t.sep,t.oct,t.nov,t.dec];

  // Calculate this month's stats
  const stats=useMemo(()=>{
    let totalH=0,shiftCount=0;
    Object.entries(company.assignments).forEach(([date,dayA])=>{
      if(dayA[empId]){
        const [y,m]=date.split("-").map(Number);
        if(y===curYear&&m-1===curMonth){
          const ids=Array.isArray(dayA[empId])?dayA[empId]:[dayA[empId]];
          ids.forEach(sid=>{
            const shift=company.shifts.find(s=>s.id===sid);
            if(shift){totalH+=shiftDuration(shift.start,shift.end);shiftCount++;}
          });
        }
      }
    });
    return {totalH,shiftCount};
  },[company,empId,curMonth,curYear]);

  return <div style={{minHeight:"100vh",background:th.bg,fontFamily:F}}>
    <header style={{
      padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",
      background:th.hdr,backdropFilter:G.blur,WebkitBackdropFilter:G.blur,
      borderBottom:`1px solid ${th.bd}`,
    }}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:32,height:32,borderRadius:16,background:th.acG,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#fff"}}>
          {emp.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{fontSize:14,fontWeight:800,color:th.tx}}>{emp.name}</div>
          <div style={{fontSize:11,color:th.t3}}>{company.name}</div>
        </div>
      </div>
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        <ThemeSwitcher theme={theme} setTheme={setTheme} th={th}/>
      </div>
    </header>

    <div style={{maxWidth:700,margin:"0 auto",padding:20}}>
      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
        <GCard th={th} style={{padding:16,textAlign:"center"}}>
          <div style={{fontSize:24,fontWeight:900,color:th.ac}}>{stats.shiftCount}</div>
          <div style={{fontSize:11,color:th.t3,fontWeight:600}}>{t.totalShifts}</div>
        </GCard>
        <GCard th={th} style={{padding:16,textAlign:"center"}}>
          <div style={{fontSize:24,fontWeight:900,color:stats.totalH>160?th.warn:th.ok}}>{formatHours(stats.totalH)}</div>
          <div style={{fontSize:11,color:th.t3,fontWeight:600}}>{t.totalHours}</div>
        </GCard>
      </div>

      {/* Month nav */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <GBtn small th={th} onClick={goPrev} disabled={!canPrev()}><Icons.ChevLeft s={16} c={th.tx}/></GBtn>
        <span style={{fontSize:16,fontWeight:800,color:th.tx}}>{monthNames[curMonth]} {curYear}</span>
        <GBtn small th={th} onClick={goNext} disabled={!canNext()}><Icons.ChevRight s={16} c={th.tx}/></GBtn>
      </div>

      <ScheduleCalendar
        company={company} month={curMonth} year={curYear}
        selectedShift={null} selectedEmp={empId} selectedLeave={null}
        onAssign={()=>{}} onRemove={()=>{}} onAssignLeave={()=>{}} onRemoveLeave={()=>{}}
        isAdmin={false} filterEmpId={empId} th={th} t={t}
      />

      {/* Legend */}
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:16,justifyContent:"center"}}>
        {company.shifts.map(s=><div key={s.id} style={{display:"flex",alignItems:"center",gap:4}}>
          <div style={{width:10,height:10,borderRadius:3,background:s.color}}/>
          <span style={{fontSize:10,color:th.t2}}>{s.name}</span>
        </div>)}
      </div>

      {/* Upcoming shifts list */}
      <GCard th={th} style={{padding:16,marginTop:20}}>
        <h3 style={{fontSize:14,fontWeight:800,color:th.tx,marginBottom:12}}>{t.yourSchedule}</h3>
        {Object.entries(company.assignments)
          .filter(([,da])=>da[empId])
          .sort(([a],[b])=>a.localeCompare(b))
          .filter(([date])=>{
            const d=new Date(date);
            return d>=new Date(new Date().setHours(0,0,0,0));
          })
          .slice(0,14)
          .map(([date,da])=>{
            const ids=Array.isArray(da[empId])?da[empId]:[da[empId]];
            const shifts=ids.map(sid=>company.shifts.find(s=>s.id===sid)).filter(Boolean);
            const d=new Date(date);
            const dayNames=[t.sunFull||"Sun",t.monFull,t.tueFull,t.wedFull,t.thuFull,t.friFull,t.satFull||"Sat"];
            return <div key={date} style={{
              display:"flex",alignItems:"center",gap:10,padding:"8px 0",
              borderBottom:`1px solid ${th.bd2}`,
            }}>
              <div style={{display:"flex",flexDirection:"column",gap:2}}>
                {shifts.map((sh,i)=><div key={i} style={{width:8,height:8,borderRadius:4,background:sh?.color||th.t3}}/>)}
              </div>
              <div style={{flex:1}}>
                <span style={{fontSize:12,fontWeight:700,color:th.tx}}>{dayNames[d.getDay()]} {d.getDate()}/{d.getMonth()+1}</span>
                <span style={{fontSize:11,color:th.t3,marginLeft:8}}>
                  {shifts.map(sh=>`${sh.name} (${sh.start}–${sh.end})`).join(" + ")}
                </span>
              </div>
            </div>;
          })}
        {Object.entries(company.assignments).filter(([,da])=>da[empId]).length===0 &&
          <p style={{fontSize:12,color:th.t3,textAlign:"center"}}>{t.noSchedule}</p>}
      </GCard>
    </div>
  </div>;
}

// ─── MAIN APP ─────────────────────────────────────────────────
export default function App(){
  const [theme,setTheme]=useState(()=>db.get("theme")||"light");
  const [lang,setLang]=useState(()=>db.get("lang")||"ro");
  const [screen,setScreen]=useState("landing");
  const [company,setCompany]=useState(null);
  const [memberEmpId,setMemberEmpId]=useState(null);
  const [recentCompanies,setRecentCompanies]=useState(()=>db.get("recent")||[]);

  const th=TH[theme]||TH.light;
  const t=TX[lang]||TX.ro;

  useEffect(()=>{db.set("theme",theme)},[theme]);
  useEffect(()=>{db.set("lang",lang)},[lang]);

  // Check URL for company/member params
  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const cId=params.get("company");
    const memberId=params.get("member");
    const role=params.get("role");
    if(cId){
      const stored=db.get("company_"+cId);
      if(stored){
        setCompany(stored);
        if(memberId){
          setMemberEmpId(memberId);
          setScreen("member");
        } else {
          setScreen("workspace");
        }
      }
    }
  },[]);

  const handleCreateCompany=(comp)=>{
    db.set("company_"+comp.id,comp);
    api.createCompany(comp);
    // Save to recent
    const r=[{id:comp.id,name:comp.name,country:comp.country,pin:comp.pin,empCount:0},...recentCompanies.filter(x=>x.id!==comp.id)].slice(0,10);
    setRecentCompanies(r);db.set("recent",r);
    setCompany(comp);setScreen("workspace");
    window.history.replaceState(null,"",`?company=${comp.id}&role=admin`);
  };

  const handleAccessCompany=(id,pin)=>{
    const stored=db.get("company_"+id);
    if(stored&&stored.pin===pin){
      setCompany(stored);setScreen("workspace");
      window.history.replaceState(null,"",`?company=${id}&role=admin`);
    }
  };

  const handleUpdateCompany=(updated)=>{
    setCompany(updated);
    db.set("company_"+updated.id,updated);
    api.updateCompany(updated);
    // Update recent
    const r=recentCompanies.map(x=>x.id===updated.id?{...x,empCount:updated.employees.length}:x);
    setRecentCompanies(r);db.set("recent",r);
  };

  const handleDeleteCompany=(id)=>{
    db.del("company_"+id);
    const r=recentCompanies.filter(x=>x.id!==id);
    setRecentCompanies(r);db.set("recent",r);
  };

  const handleGoHome=()=>{
    setCompany(null);setScreen("landing");setMemberEmpId(null);
    window.history.replaceState(null,"",window.location.pathname);
  };

  if(screen==="member"&&company&&memberEmpId){
    return <MemberView company={company} empId={memberEmpId}
      th={th} t={t} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme}/>;
  }

  if(screen==="workspace"&&company){
    return <Workspace company={company} onUpdate={handleUpdateCompany} onGoHome={handleGoHome}
      th={th} t={t} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme}/>;
  }

  return <Landing
    onCreateCompany={handleCreateCompany}
    onAccessCompany={handleAccessCompany}
    onDeleteCompany={handleDeleteCompany}
    recentCompanies={recentCompanies}
    th={th} t={t} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme}/>;
}
