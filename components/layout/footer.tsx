import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Leaf, Shield, Users, FileText } from "lucide-react"

interface FooterProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function Footer() {
  return (
    <footer className="w-full bg-white shadow border-t border-gray-200 text-gray-600 text-center py-3 text-sm">
      &copy; 2025 ErvApp. Todos os direitos reservados.
    </footer>
  )
} 