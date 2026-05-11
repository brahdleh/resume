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

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 44,
    color: "#111827",
  },
  header: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: "#e5e7eb",
    alignItems: "center",
  },
  name: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  jobTitle: {
    fontSize: 11,
    color: "#4b5563",
    marginBottom: 5,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  contactItem: {
    fontSize: 9,
    color: "#6b7280",
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#374151",
    borderBottomWidth: 0.75,
    borderBottomColor: "#d1d5db",
    paddingBottom: 3,
    marginBottom: 8,
  },
  experienceItem: {
    marginBottom: 10,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 1,
  },
  expRole: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
  },
  expDate: {
    fontSize: 9,
    color: "#6b7280",
  },
  expCompany: {
    fontSize: 9.5,
    color: "#4b5563",
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 2,
  },
  bullet: {
    width: 10,
    fontSize: 9,
    color: "#4b5563",
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
    color: "#1f2937",
    lineHeight: 1.4,
  },
  bulletMetrics: {
    color: "#6b7280",
  },
  summaryText: {
    fontSize: 9.5,
    color: "#1f2937",
    lineHeight: 1.5,
  },
  educationItem: {
    marginBottom: 7,
  },
  eduHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  eduDegree: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
  },
  eduDate: {
    fontSize: 9,
    color: "#6b7280",
  },
  eduInstitution: {
    fontSize: 9.5,
    color: "#4b5563",
  },
  skillRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  skillCategory: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    width: 110,
    color: "#374151",
  },
  skillList: {
    flex: 1,
    fontSize: 9.5,
    color: "#1f2937",
  },
  certItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  certName: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
  },
  certIssuer: {
    fontSize: 9,
    color: "#6b7280",
  },
  certDate: {
    fontSize: 9,
    color: "#6b7280",
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
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Professional Summary</Text>
      <Text style={styles.summaryText}>{summary.content}</Text>
    </View>
  )
}

function ExperienceSection({ cv, master }: Props) {
  const selected = cv.selectedExperienceIds
    .map((id) => master.experiences.find((e) => e.id === id))
    .filter(Boolean) as typeof master.experiences

  if (selected.length === 0) return null

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Experience</Text>
      {selected.map((exp) => {
        const achIds = cv.selectedAchievementsPerExperience[exp.id] ?? []
        const achs = achIds
          .map((id) => exp.achievements.find((a) => a.id === id))
          .filter(Boolean) as typeof exp.achievements

        return (
          <View key={exp.id} style={styles.experienceItem}>
            <View style={styles.expHeader}>
              <Text style={styles.expRole}>{exp.role}</Text>
              <Text style={styles.expDate}>
                {exp.startDate} – {exp.endDate}
              </Text>
            </View>
            <Text style={styles.expCompany}>
              {exp.company}
              {exp.location ? ` · ${exp.location}` : ""}
            </Text>
            {achs.map((ach) => (
              <View key={ach.id} style={styles.bulletRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>
                  {ach.content}
                  {ach.metrics ? (
                    <Text style={styles.bulletMetrics}> — {ach.metrics}</Text>
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
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Education</Text>
      {selected.map((edu) => (
        <View key={edu.id} style={styles.educationItem}>
          <View style={styles.eduHeader}>
            <Text style={styles.eduDegree}>
              {edu.degree} in {edu.field}
            </Text>
            <Text style={styles.eduDate}>
              {edu.startDate} – {edu.endDate}
            </Text>
          </View>
          <Text style={styles.eduInstitution}>
            {edu.institution}
            {edu.grade ? ` · ${edu.grade}` : ""}
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
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Skills</Text>
      {Object.entries(grouped).map(([cat, catSkills]) => (
        <View key={cat} style={styles.skillRow}>
          <Text style={styles.skillCategory}>{cat}:</Text>
          <Text style={styles.skillList}>
            {catSkills.map((s) => s.name).join(", ")}
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
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Certifications</Text>
      {selected.map((cert) => (
        <View key={cert.id} style={styles.certItem}>
          <View>
            <Text style={styles.certName}>{cert.name}</Text>
            <Text style={styles.certIssuer}>{cert.issuer}</Text>
          </View>
          <Text style={styles.certDate}>{cert.date}</Text>
        </View>
      ))}
    </View>
  )
}

const sectionMap: Record<
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
  ].filter(Boolean)

  return (
    <Document
      title={cv.name}
      author={personalInfo.name}
      creator="CV Studio"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{personalInfo.name || "Your Name"}</Text>
          {personalInfo.title && (
            <Text style={styles.jobTitle}>{personalInfo.title}</Text>
          )}
          {contactItems.length > 0 && (
            <View style={styles.contactRow}>
              {contactItems.map((item, i) => (
                <Text key={i} style={styles.contactItem}>
                  {item}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Sections in order */}
        {cv.sectionOrder.map((section) => {
          const Component = sectionMap[section]
          return Component ? (
            <Component key={section} cv={cv} master={master} />
          ) : null
        })}
      </Page>
    </Document>
  )
}
