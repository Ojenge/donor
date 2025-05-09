"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectNameMappings = void 0;
exports.getNormalizedProjectName = getNormalizedProjectName;
exports.projectNameMappings = [
    {
        original: "EA's Centres of Excel. for Skills & Tertiary Edu. in Biosciences- II",
        normalized: "East Africa's Centre of Excellence for Skills &amp; Tertiary Education"
    },
    {
        original: "Last Mile County Connectivity Network Phase IV & V - BETA",
        normalized: "Last Mile County Connectivity Network Phase IV &amp; V - BETA"
    },
    {
        original: "Strengthening, Drought Resilience of  small scale  Farmers & pastoralist",
        normalized: "Strengthening, Drought Resilience of  small scale  Farmers &amp; pastoralist"
    },
    {
        original: "Pediatric Emergency Center & National Burns Center at KNH",
        normalized: "Pediatric Emergency Center &amp; National Burns Center at KNH"
    },
    {
        original: "Upgrading of Maternal & New Born Units Project",
        normalized: "Upgrading of Maternal &amp; New Born Units Project"
    },
    {
        original: "South Sudan Eastern Africa Regional Trade & Transport Facilitation  Development Project",
        normalized: "South Sudan Eastern Africa Regional Trade &amp; Transport Facilitation  Development Project"
    },
    {
        original: "Kabonyo Fisheries & Aquaculture Service and Training Centre of Excellence",
        normalized: "Kabonyo Fisheries &amp; Aquaculture Service and Training Centre of Excellence"
    },
    {
        original: "East Africa Transport, Trade & Development Facilitation Project.",
        normalized: "East Africa Transport, Trade &amp; Development Facilitation Project."
    },
    {
        original: "Infrastructure Finance & PPP Project (IF-PPP)/AF - BETA.",
        normalized: "Infrastructure Finance &amp; PPP Project (IF-PPP)/AF - BETA."
    },
    {
        original: "Supporting Access to Finance & Enterprise Recovery (SAFER)",
        normalized: "Supporting Access to Finance &amp; Enterprise Recovery (SAFER)"
    },
    {
        original: "Combating Poaching & Illegal Wildlife Trafficking Int. Approach(IWT).",
        normalized: "Combating Poaching &amp; Illegal Wildlife Trafficking Int. Approach(IWT)."
    }
];
function getNormalizedProjectName(projectName) {
    const mapping = exports.projectNameMappings.find(m => m.original === projectName);
    return mapping ? mapping.normalized : projectName;
}
//# sourceMappingURL=projectNameMappings.js.map