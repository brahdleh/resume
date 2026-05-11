import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer"
import type { CVDocument } from "@/types/cv"
import type { useMasterStore } from "@/store/masterStore"

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

// Unit conversions: 1 cm = 28.3465 pt
// Top 1.5cm = 42pt | Bottom 1.3cm = 37pt | Left 1.3cm = 37pt | Right 2cm = 57pt
const s = StyleSheet.create({
  page: {
    fontFamily: "Calibri",
    fontWeight: 400,
    fontSize: 11,
    paddingTop: 42,
    paddingBottom: 37,
    paddingLeft: 37,
    paddingRight: 57,
    color: "#1a1a1a",
  },

  // ── Header block ─────────────────────────────────────────────────────────
  header: {
    alignItems: "center",
    marginBottom: 10,
  },
  name: {
    fontSize: 25,
    fontWeight: 700,
    letterSpacing: 0.3,
    color: "#1a1a1a",
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 9,
    color: "#555555",
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  contactItem: {
    fontSize: 9,
    color: "#555555",
  },
  contactSep: {
    fontSize: 9,
    color: "#aaaaaa",
  },

  // ── Section ──────────────────────────────────────────────────────────────
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#1a1a1a",
    borderBottomWidth: 0.75,
    borderBottomColor: "#999999",
    paddingBottom: 1,
    marginBottom: 5,
  },
  // Summary gets no underline rule — it flows straight from the header
  sectionTitleSummary: {
    fontSize: 11,
    fontWeight: 700,
    color: "#1a1a1a",
    marginBottom: 5,
  },

  // ── Body text ────────────────────────────────────────────────────────────
  summaryText: {
    fontSize: 11,
    color: "#1a1a1a",
    lineHeight: 1.4,
  },

  // ── Experience ───────────────────────────────────────────────────────────
  experienceItem: {
    marginBottom: 9,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  expRole: {
    fontSize: 11,
    fontWeight: 700,
  },
  expDate: {
    fontSize: 11,
    color: "#555555",
  },
  expCompany: {
    fontSize: 11,
    color: "#555555",
    marginBottom: 3,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 1.5,
    paddingLeft: 2,
  },
  bullet: {
    width: 10,
    fontSize: 11,
    color: "#333333",
  },
  bulletText: {
    flex: 1,
    fontSize: 11,
    color: "#1a1a1a",
    lineHeight: 1.35,
  },
  bulletMetrics: {
    color: "#555555",
  },

  // ── Education ────────────────────────────────────────────────────────────
  educationItem: {
    marginBottom: 7,
  },
  eduHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  eduDegree: {
    fontSize: 11,
    fontWeight: 700,
  },
  eduDate: {
    fontSize: 11,
    color: "#555555",
  },
  eduInstitution: {
    fontSize: 11,
    color: "#555555",
  },

  // ── Skills ───────────────────────────────────────────────────────────────
  skillRow: {
    flexDirection: "row",
    marginBottom: 2.5,
  },
  skillCategory: {
    fontSize: 11,
    fontWeight: 700,
    width: 120,
    color: "#1a1a1a",
  },
  skillList: {
    flex: 1,
    fontSize: 11,
    color: "#1a1a1a",
  },

  // ── Certifications ───────────────────────────────────────────────────────
  certItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  certName: {
    fontSize: 11,
    fontWeight: 700,
  },
  certIssuer: {
    fontSize: 11,
    color: "#555555",
  },
  certDate: {
    fontSize: 11,
    color: "#555555",
  },
})

interface Props {
  cv: CVDocument
  master: MasterState
}

function SummarySection({ cv, master }: Props) {
  const summary = master.summaries.find((s) => s.id === cv.selectedSummaryId)
  if (!summary) return null
  return (
    <View style={s.section}>
      <Text style={s.sectionTitleSummary}>SUMMARY</Text>
      <Text style={s.summaryText}>{summary.content}</Text>
    </View>
  )
}

function ExperienceSection({ cv, master }: Props) {
  const selected = cv.selectedExperienceIds
    .map((id) => master.experiences.find((e) => e.id === id))
    .filter(Boolean) as typeof master.experiences

  if (selected.length === 0) return null

  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>EXPERIENCE</Text>
      {selected.map((exp) => {
        const achIds = cv.selectedAchievementsPerExperience[exp.id] ?? []
        const achs = achIds
          .map((id) => exp.achievements.find((a) => a.id === id))
          .filter(Boolean) as typeof exp.achievements

        return (
          <View key={exp.id} style={s.experienceItem}>
            <View style={s.expHeader}>
              <Text style={s.expRole}>{exp.role}</Text>
              <Text style={s.expDate}>
                {exp.startDate} – {exp.endDate}
              </Text>
            </View>
            <Text style={s.expCompany}>
              {exp.company}
              {exp.location ? `  ·  ${exp.location}` : ""}
            </Text>
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
          </View>
        )
      })}
    </View>
  )
}

function EducationSection({ cv, master }: Props) {
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
            <Text style={s.eduDate}>
              {edu.startDate} – {edu.endDate}
            </Text>
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

function SkillsSection({ cv, master }: Props) {
  const selected = master.skills.filter((s) =>
    cv.selectedSkillIds.includes(s.id)
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

function CertificationsSection({ cv, master }: Props) {
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

const SECTION_RENDERERS: Record<
  string,
  (props: Props) => React.ReactElement | null
> = {
  summary: SummarySection,
  experience: ExperienceSection,
  education: EducationSection,
  skills: SkillsSection,
  certifications: CertificationsSection,
}

export function CVPDFDocument({ cv, master }: Props) {
  const { personalInfo } = master

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
          {personalInfo.title && (
            <Text style={s.jobTitle}>{personalInfo.title}</Text>
          )}
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
        </View>

        {/* ── Sections in user-defined order ── */}
        {cv.sectionOrder.map((section) => {
          const Component = SECTION_RENDERERS[section]
          return Component ? (
            <Component key={section} cv={cv} master={master} />
          ) : null
        })}
      </Page>
    </Document>
  )
}
