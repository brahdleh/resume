import {
  Document,
  Page,
  Text,
  View,
  Font,
} from "@react-pdf/renderer"
import type { CVDocument } from "@/types/cv"
import type { useMasterStore } from "@/store/masterStore"
import { DEFAULT_FORMAT, type FormatSettings } from "@/store/formatStore"

type MasterState = ReturnType<typeof useMasterStore.getState>

// Carlito — open-source Calibri equivalent, identical metrics/spacing.
// TTF files served directly from the official Google Fonts GitHub repo.
// To use real Calibri: drop calibri.ttf / calibri-bold.ttf into public/fonts/
// and replace the src values below with "/fonts/calibri.ttf" etc.
Font.register({
  family: "Calibri",
  fonts: [
    {
      src: "https://raw.githubusercontent.com/googlefonts/carlito/main/fonts/ttf/Carlito-Regular.ttf",
      fontWeight: 400,
      fontStyle: "normal",
    },
    {
      src: "https://raw.githubusercontent.com/googlefonts/carlito/main/fonts/ttf/Carlito-Bold.ttf",
      fontWeight: 700,
      fontStyle: "normal",
    },
    {
      src: "https://raw.githubusercontent.com/googlefonts/carlito/main/fonts/ttf/Carlito-Italic.ttf",
      fontWeight: 400,
      fontStyle: "italic",
    },
    {
      src: "https://raw.githubusercontent.com/googlefonts/carlito/main/fonts/ttf/Carlito-BoldItalic.ttf",
      fontWeight: 700,
      fontStyle: "italic",
    },
  ],
})

function makeStyles(fmt: FormatSettings) {
  const { colorText, colorMuted, colorSectionRule, fontSizeBody } = fmt
  return {
    page: {
      fontFamily: "Calibri",
      fontWeight: 400,
      fontSize: fontSizeBody,
      paddingTop: fmt.marginTop,
      paddingBottom: fmt.marginBottom,
      paddingLeft: fmt.marginLeft,
      paddingRight: fmt.marginRight,
      color: colorText,
    },

    // ── Header block ───────────────────────────────────────────────────────
    header: {
      alignItems: "center" as const,
      marginBottom: 10,
    },
    name: {
      fontSize: fmt.fontSizeName,
      fontWeight: 700,
      letterSpacing: 0.3,
      color: colorText,
      marginBottom: 2,
    },
    jobTitle: {
      fontSize: fmt.fontSizeContact,
      color: colorMuted,
      marginTop: 2,
    },
    contactRow: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      justifyContent: "center" as const,
      gap: 10,
    },
    contactItem: {
      fontSize: fmt.fontSizeContact,
      color: colorMuted,
    },
    contactSep: {
      fontSize: fmt.fontSizeContact,
      color: "#aaaaaa",
    },

    // ── Section ────────────────────────────────────────────────────────────
    section: {
      marginBottom: fmt.sectionGap,
    },
    sectionTitle: {
      fontSize: fontSizeBody,
      fontWeight: 700,
      color: colorText,
      borderBottomWidth: 0.75,
      borderBottomColor: colorSectionRule,
      paddingBottom: 1,
      marginBottom: 5,
    },
    sectionTitleSummary: {
      fontSize: fontSizeBody,
      fontWeight: 700,
      color: colorText,
      borderBottomWidth: 0.75,
      borderBottomColor: colorSectionRule,
      paddingBottom: 1,
      marginTop: fmt.summaryTopGap,
      marginBottom: 5,
    },

    // ── Body text ──────────────────────────────────────────────────────────
    summaryText: {
      fontSize: fontSizeBody,
      color: colorText,
      lineHeight: fmt.lineHeight,
    },

    // ── Experience ─────────────────────────────────────────────────────────
    experienceItem: {
      marginBottom: fmt.expItemGap,
    },
    expHeader: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "flex-start" as const,
    },
    expRole: {
      fontSize: fontSizeBody,
      fontWeight: 700,
    },
    expDate: {
      fontSize: fontSizeBody,
      color: colorMuted,
    },
    expCompany: {
      fontSize: fontSizeBody,
      color: colorMuted,
      marginBottom: 3,
    },
    expCompanyGrouped: {
      fontSize: fontSizeBody,
      fontWeight: 700,
      color: colorText,
      marginBottom: 3,
    },
    groupedLine: {
      width: 1.5,
      backgroundColor: "#cccccc",
      marginRight: 9,
      marginTop: 1,
      marginBottom: 1,
    },
    groupedRoles: {
      flex: 1,
    },
    groupedRole: {
      marginBottom: 6,
    },
    bulletRow: {
      flexDirection: "row" as const,
      marginBottom: 1.5,
      paddingLeft: 2,
    },
    bullet: {
      width: 10,
      fontSize: fontSizeBody,
      color: "#333333",
    },
    bulletText: {
      flex: 1,
      fontSize: fontSizeBody,
      color: colorText,
      lineHeight: fmt.bulletLineHeight,
    },
    bulletMetrics: {
      color: colorMuted,
    },

    // ── Education ──────────────────────────────────────────────────────────
    educationItem: {
      marginBottom: 7,
    },
    eduHeader: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "flex-start" as const,
    },
    eduDegree: {
      fontSize: fontSizeBody,
      fontWeight: 700,
    },
    eduDate: {
      fontSize: fontSizeBody,
      color: colorMuted,
    },
    eduInstitution: {
      fontSize: fontSizeBody,
      color: colorMuted,
    },

    // ── Skills ─────────────────────────────────────────────────────────────
    skillRow: {
      flexDirection: "row" as const,
      marginBottom: 2.5,
    },
    skillCategory: {
      fontSize: fontSizeBody,
      fontWeight: 700,
      width: 120,
      color: colorText,
    },
    skillList: {
      flex: 1,
      fontSize: fontSizeBody,
      color: colorText,
    },

    // ── Certifications ─────────────────────────────────────────────────────
    certItem: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      marginBottom: 4,
    },
    certName: {
      fontSize: fontSizeBody,
      fontWeight: 700,
    },
    certIssuer: {
      fontSize: fontSizeBody,
      color: colorMuted,
    },
    certDate: {
      fontSize: fontSizeBody,
      color: colorMuted,
    },
  }
}

type Styles = ReturnType<typeof makeStyles>

interface Props {
  cv: CVDocument
  master: MasterState
  s: Styles
}

function SummarySection({ cv, master, s }: Props) {
  const summary = master.summaries.find((sm) => sm.id === cv.selectedSummaryId)
  if (!summary) return null
  return (
    <View style={s.section}>
      <Text style={s.sectionTitleSummary}>SUMMARY</Text>
      <Text style={s.summaryText}>{summary.content}</Text>
    </View>
  )
}

type ExpEntry = ReturnType<typeof useMasterStore.getState>["experiences"][number]

function BulletList({ exp, cv, s }: { exp: ExpEntry; cv: CVDocument; s: Styles }) {
  const achIds = cv.selectedAchievementsPerExperience[exp.id] ?? []
  const achs = achIds
    .map((id) => exp.achievements.find((a) => a.id === id))
    .filter(Boolean) as ExpEntry["achievements"]
  return (
    <>
      {achs.map((ach) => (
        <View key={ach.id} style={s.bulletRow}>
          <Text style={s.bullet}>•</Text>
          <Text style={s.bulletText}>
            {ach.content}
            {ach.metrics ? (
              <Text style={s.bulletMetrics}>{"  "}— {ach.metrics}</Text>
            ) : null}
          </Text>
        </View>
      ))}
    </>
  )
}

function SingleExpEntry({ exp, cv, s }: { exp: ExpEntry; cv: CVDocument; s: Styles }) {
  return (
    <View style={s.experienceItem}>
      <Text style={s.expCompanyGrouped}>
        {exp.company}{exp.location ? `  ·  ${exp.location}` : ""}
      </Text>
      <View style={s.expHeader}>
        <Text style={s.expRole}>{exp.role}</Text>
        <Text style={s.expDate}>{[exp.startDate, exp.endDate].filter(Boolean).join(" – ")}</Text>
      </View>
      <BulletList exp={exp} cv={cv} s={s} />
    </View>
  )
}

function GroupedExpEntry({
  company,
  exps,
  cv,
  s,
}: {
  company: string
  exps: ExpEntry[]
  cv: CVDocument
  s: Styles
}) {
  return (
    <View style={s.experienceItem}>
      <Text style={s.expCompanyGrouped}>{company}</Text>
      <View style={{ flexDirection: "row" }}>
        <View style={s.groupedLine} />
        <View style={s.groupedRoles}>
          {exps.map((exp, i) => (
            <View
              key={exp.id}
              style={i < exps.length - 1 ? s.groupedRole : undefined}
            >
              <View style={s.expHeader}>
                <Text style={s.expRole}>{exp.role}</Text>
                <Text style={s.expDate}>{[exp.startDate, exp.endDate].filter(Boolean).join(" – ")}</Text>
              </View>
              <BulletList exp={exp} cv={cv} s={s} />
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

function ExperienceSection({ cv, master, s }: Props) {
  const selected = cv.selectedExperienceIds
    .map((id) => master.experiences.find((e) => e.id === id))
    .filter(Boolean) as ExpEntry[]

  if (selected.length === 0) return null

  const companyOrder: string[] = []
  const grouped: Record<string, ExpEntry[]> = {}
  for (const exp of selected) {
    if (!grouped[exp.company]) {
      grouped[exp.company] = []
      companyOrder.push(exp.company)
    }
    grouped[exp.company].push(exp)
  }

  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>EXPERIENCE</Text>
      {companyOrder.map((company) => {
        const exps = grouped[company]
        return exps.length === 1 ? (
          <SingleExpEntry key={exps[0].id} exp={exps[0]} cv={cv} s={s} />
        ) : (
          <GroupedExpEntry key={company} company={company} exps={exps} cv={cv} s={s} />
        )
      })}
    </View>
  )
}

function EducationSection({ cv, master, s }: Props) {
  const selected = master.education.filter((e) =>
    cv.selectedEducationIds.includes(e.id)
  )
  if (selected.length === 0) return null

  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>EDUCATION</Text>
      {selected.map((edu) => (
        <View key={edu.id} style={s.educationItem}>
          <View style={s.eduHeader}>
            <Text style={s.eduDegree}>
              {edu.degree} in {edu.field}
            </Text>
            <Text style={s.eduDate}>{[edu.startDate, edu.endDate].filter(Boolean).join(" – ")}</Text>
          </View>
          <Text style={s.eduInstitution}>
            {edu.institution}
            {edu.grade ? `  ·  ${edu.grade}` : ""}
          </Text>
        </View>
      ))}
    </View>
  )
}

function SkillsSection({ cv, master, s }: Props) {
  const selected = master.skills.filter((sk) =>
    cv.selectedSkillIds.includes(sk.id)
  )
  if (selected.length === 0) return null

  const grouped = selected.reduce<Record<string, typeof selected>>(
    (acc, skill) => ({
      ...acc,
      [skill.category]: [...(acc[skill.category] ?? []), skill],
    }),
    {}
  )

  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>SKILLS</Text>
      {Object.entries(grouped).map(([cat, catSkills]) => (
        <View key={cat} style={s.skillRow}>
          <Text style={s.skillCategory}>{cat}</Text>
          <Text style={s.skillList}>
            {catSkills.map((sk) => sk.name).join(", ")}
          </Text>
        </View>
      ))}
    </View>
  )
}

function CertificationsSection({ cv, master, s }: Props) {
  const selected = master.certifications.filter((c) =>
    cv.selectedCertificationIds.includes(c.id)
  )
  if (selected.length === 0) return null

  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>CERTIFICATIONS</Text>
      {selected.map((cert) => (
        <View key={cert.id} style={s.certItem}>
          <View>
            <Text style={s.certName}>{cert.name}</Text>
            <Text style={s.certIssuer}>{cert.issuer}</Text>
          </View>
          <Text style={s.certDate}>{cert.date}</Text>
        </View>
      ))}
    </View>
  )
}

const SECTION_RENDERERS: Record<string, (props: Props) => React.ReactElement | null> = {
  summary: SummarySection,
  experience: ExperienceSection,
  education: EducationSection,
  skills: SkillsSection,
  certifications: CertificationsSection,
}

interface CVPDFDocumentProps {
  cv: CVDocument
  master: MasterState
  fmt?: FormatSettings
}

export function CVPDFDocument({ cv, master, fmt = DEFAULT_FORMAT }: CVPDFDocumentProps) {
  const { personalInfo } = master
  const s = makeStyles(fmt)

  const contactItems = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    personalInfo.linkedin,
    personalInfo.github,
    personalInfo.website,
  ].filter(Boolean) as string[]

  return (
    <Document title={cv.name} author={personalInfo.name} creator="CV Studio">
      <Page size="A4" style={s.page}>
        {/* ── Header ── */}
        <View style={s.header}>
          <Text style={s.name}>{personalInfo.name || "Your Name"}</Text>
          {contactItems.length > 0 && (
            <View style={s.contactRow}>
              {contactItems.map((item, i) => (
                <View key={i} style={{ flexDirection: "row", gap: 10 }}>
                  {i > 0 && <Text style={s.contactSep}>|</Text>}
                  <Text style={s.contactItem}>{item}</Text>
                </View>
              ))}
            </View>
          )}
          {personalInfo.title && (
            <Text style={s.jobTitle}>{personalInfo.title}</Text>
          )}
        </View>

        {/* ── Sections in user-defined order ── */}
        {cv.sectionOrder.map((section) => {
          const Component = SECTION_RENDERERS[section]
          return Component ? (
            <Component key={section} cv={cv} master={master} s={s} />
          ) : null
        })}
      </Page>
    </Document>
  )
}
