import { getData } from '@/lib/getStrainsData';
import PesquisaStrains from '@/components/strains/PesquisaStrains';
import LayoutContent from '@/components/layout/layout-content';

const PRINCIPAIS = [
  'OG Kush', 'White Widow', 'Amnesia Haze', 'Blue Dream', 'Northern Lights', 'Gorilla Glue',
  'Girl Scout Cookies', 'Sour Diesel', 'Skunk', 'Critical', 'Jack Herer', 'Purple Haze', 'AK-47',
  'Super Lemon Haze', 'Durban Poison', 'Cheese', 'Pineapple Express', 'Granddaddy Purple',
  'Lemon Skunk', 'Strawberry Cough', 'Chocolope', 'Bubba Kush', 'Gelato', 'Wedding Cake', 'Runtz',
  'Zkittlez', 'Do-Si-Dos', 'Bruce Banner', 'Banana Kush', 'Trainwreck', 'Green Crack', 'Mango Kush',
  'Apple Fritter', 'Sunset Sherbet', 'Sherbet', 'Tangie', 'GSC', 'Cookies', 'Lemon Haze', 'Haze',
  'Kush', 'Diesel', 'Blueberry', 'Orange Bud', 'Candy Kush', 'Moby Dick', 'Amnesia', 'Lemon OG',
  'OG', 'White Rhino', 'Master Kush', 'Black Domina', 'NYC Diesel', 'Super Silver Haze', 'Lemon Pie',
  'Tropicana Cookies', 'Tropicanna', 'Tropicana Banana', 'Tropicana Cherry', 'Tropicana Punch',
  'Tropicana Poison', 'Tropicana Skunk', 'Tropicana Zkittlez', 'Tropicana Dream', 'Tropicana OG',
  'Tropicana Haze', 'Tropicana Diesel', 'Tropicana Blueberry', 'Tropicana Orange', 'Tropicana Candy',
  'Tropicana Moby', 'Tropicana Amnesia', 'Tropicana Lemon', 'Tropicana OG Kush', 'Tropicana White Widow',
  'Tropicana Amnesia Haze', 'Tropicana Blue Dream', 'Tropicana Northern Lights', 'Tropicana Gorilla Glue',
  'Tropicana Girl Scout Cookies', 'Tropicana Sour Diesel', 'Tropicana Skunk', 'Tropicana Critical',
  'Tropicana Jack Herer', 'Tropicana Purple Haze', 'Tropicana AK-47', 'Tropicana Super Lemon Haze',
  'Tropicana Durban Poison', 'Tropicana Cheese', 'Tropicana Pineapple Express', 'Tropicana Granddaddy Purple',
  'Tropicana Lemon Skunk', 'Tropicana Strawberry Cough', 'Tropicana Chocolope', 'Tropicana Bubba Kush',
  'Tropicana Gelato', 'Tropicana Wedding Cake', 'Tropicana Runtz', 'Tropicana Zkittlez', 'Tropicana Do-Si-Dos',
  'Tropicana Bruce Banner', 'Tropicana Banana Kush', 'Tropicana Trainwreck', 'Tropicana Green Crack',
  'Tropicana Mango Kush', 'Tropicana Apple Fritter', 'Tropicana Sunset Sherbet', 'Tropicana Sherbet',
  'Tropicana Tangie', 'Tropicana GSC', 'Tropicana Cookies', 'Tropicana Lemon Haze', 'Tropicana Haze',
  'Tropicana Kush', 'Tropicana Diesel', 'Tropicana Blueberry', 'Tropicana Orange Bud', 'Tropicana Candy Kush',
  'Tropicana Moby Dick', 'Tropicana Amnesia', 'Tropicana Lemon OG', 'Tropicana OG', 'Tropicana White Rhino',
  'Tropicana Master Kush', 'Tropicana Black Domina', 'Tropicana NYC Diesel', 'Tropicana Super Silver Haze',
  'Tropicana Lemon Pie'
];

export default async function Page() {
  const allStrains = await getData();
  const principais = allStrains.filter(s => PRINCIPAIS.includes(s["Strain"]));
  const outras = allStrains.filter(s => !PRINCIPAIS.includes(s["Strain"]));

  // Garante pelo menos 18 cards para preencher 3 linhas de 6 colunas
  const principaisExibidas = principais.slice(0, 18);
  const outrasExibidas = outras.slice(0, Math.max(0, 18 - principaisExibidas.length));

  return (
    <LayoutContent>
      <h1 className="text-3xl font-bold mb-8 text-center text-green-800">Biblioteca de Genéticas</h1>
      <PesquisaStrains principais={principais} outras={outras} />
      <div className="text-xs text-gray-500 text-center mt-8 w-full flex justify-center items-center">Fonte: Base de dados Leafly obtidos via Kaggle.</div>
    </LayoutContent>
  );
} 