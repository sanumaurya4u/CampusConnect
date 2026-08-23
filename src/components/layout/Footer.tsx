import { Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { APP_NAME } from '@/constants'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#F2ECE1]/70 border-t border-[#E5DFD5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-[#181512] rounded-lg flex items-center justify-center shadow-xs">
              <GraduationCap className="h-4 w-4 text-[#E05326]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-stone-900 leading-tight">{APP_NAME}</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500">UIET MDU Rohtak</span>
            </div>
          </div>

          <nav className="flex items-center gap-6 flex-wrap justify-center">
            <Link to="/" className="text-xs font-semibold text-stone-600 hover:text-[#E05326] transition-colors">
              Home
            </Link>
            <Link to="/clubs" className="text-xs font-semibold text-stone-600 hover:text-[#E05326] transition-colors">
              Clubs
            </Link>
            <Link to="/events" className="text-xs font-semibold text-stone-600 hover:text-[#E05326] transition-colors">
              Events
            </Link>
            <Link to="/projects" className="text-xs font-semibold text-stone-600 hover:text-[#E05326] transition-colors">
              Projects
            </Link>
            <Link to="/passport" className="text-xs font-semibold text-stone-600 hover:text-[#E05326] transition-colors">
              Activity Passport
            </Link>
          </nav>

          <p className="text-xs font-mono text-stone-500">
            &copy; {currentYear} {APP_NAME} &bull; UIET MDU
          </p>
        </div>
      </div>
    </footer>
  )
}
