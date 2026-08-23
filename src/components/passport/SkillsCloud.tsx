import { Code2, Sparkles } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui'

interface SkillsCloudProps {
  skills: string[]
}

export function SkillsCloud({ skills }: SkillsCloudProps) {
  return (
    <Card className="editorial-card">
      <CardHeader className="flex items-center justify-between border-b border-[#EFE9DF]">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-[#E05326]" />
          <h2 className="text-sm sm:text-base font-bold text-stone-900">
            Validated Extracurricular Skills
          </h2>
        </div>
        <span className="text-[10px] font-mono font-bold text-[#E05326] bg-[#E05326]/10 border border-[#E05326]/30 px-2.5 py-0.5 rounded-full uppercase">
          {skills.length} Competencies
        </span>
      </CardHeader>
      <CardBody className="p-6 space-y-4">
        <p className="text-xs text-stone-600 leading-relaxed">
          Competencies demonstrated and validated through accepted campus project roles, technical workshops, and club leadership.
        </p>

        {skills.length === 0 ? (
          <p className="text-xs text-stone-400 py-4 text-center font-mono">
            No extracurricular skills registered yet. Participate in projects and workshops to build your skill cloud.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE9DF] border border-[#E2DAD0] text-xs font-semibold text-stone-800 hover:border-stone-400 hover:bg-[#EBE3D5] transition-colors"
              >
                <Sparkles className="h-3 w-3 text-[#E05326] shrink-0" />
                <span>{skill}</span>
              </span>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  )
}
