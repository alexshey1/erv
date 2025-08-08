import { Droplets, Scissors, Sprout, CheckCircle2, Leaf, FlaskConical, Flower2, Sun, Bug, ShieldCheck, Award, Info } from "lucide-react";
import type { ReactNode } from "react";

const eventIcons: Record<string, ReactNode> = {
  rega: <Droplets className="h-5 w-5" stroke="#3b82f6" />, // azul-500
  irrigacao: <Droplets className="h-5 w-5" stroke="#3b82f6" />, // azul-500
  irrigação: <Droplets className="h-5 w-5" stroke="#3b82f6" />, // azul-500
  water: <Droplets className="h-5 w-5" stroke="#3b82f6" />, // azul-500
  irrigation: <Droplets className="h-5 w-5" stroke="#3b82f6" />, // azul-500
  poda: <Scissors className="h-5 w-5" stroke="#15803d" />, // green-700
  pruning: <Scissors className="h-5 w-5" stroke="#15803d" />, // green-700
  fertilizacao: <FlaskConical className="h-5 w-5" stroke="#06b6d4" />, // cyan-600
  fertilização: <FlaskConical className="h-5 w-5" stroke="#06b6d4" />, // cyan-600
  fertilization: <FlaskConical className="h-5 w-5" stroke="#06b6d4" />, // cyan-600
  germinacao: <Sprout className="h-5 w-5" stroke="#65a30d" />, // lime-600
  germinação: <Sprout className="h-5 w-5" stroke="#65a30d" />, // lime-600
  germination: <Sprout className="h-5 w-5" stroke="#65a30d" />, // lime-600
  seedling: <Sprout className="h-5 w-5" stroke="#4ade80" />, // green-400
  vegetative: <Leaf className="h-5 w-5" stroke="#16a34a" />, // green-600
  flowering: <Flower2 className="h-5 w-5" stroke="#ec4899" />, // pink-500
  drying: <Sun className="h-5 w-5" stroke="#facc15" />, // yellow-500
  curing: <Award className="h-5 w-5" stroke="#f59e42" />, // orange-500
  harvest: <CheckCircle2 className="h-5 w-5" stroke="#059669" />, // emerald-600
  colheita: <CheckCircle2 className="h-5 w-5" stroke="#059669" />, // emerald-600
  nutrients: <FlaskConical className="h-5 w-5" stroke="#0891b2" />, // cyan-700
  pest_control: <ShieldCheck className="h-5 w-5" stroke="#ef4444" />, // red-500
  pest: <Bug className="h-5 w-5" stroke="#b91c1c" />, // red-700
  action: <CheckCircle2 className="h-5 w-5" stroke="#6b7280" />, // gray-500
  start_veg: <Leaf className="h-5 w-5" stroke="#22c55e" />, // green-500
  other: <Info className="h-5 w-5" stroke="#6b7280" />, // gray-400
  default: <Leaf className="h-5 w-5" stroke="#6b7280" /> // gray-400
};

export function getEventIcon(type: string): ReactNode {
  return eventIcons[type] || eventIcons.default;
} 