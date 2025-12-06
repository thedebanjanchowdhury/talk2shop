import { FaKeyboard, FaMouse, FaVolumeUp, FaHeadphones, FaBox, FaMicrochip, FaHdd, FaBolt,FaFan  } from "react-icons/fa";
import { MdMonitor } from "react-icons/md";
//import { GiVideoCard } from "react-icons/gi";

const categories = [
  { id: 1, name: "Keyboards", icon: <FaKeyboard /> },
  { id: 2, name: "Mice", icon: <FaMouse /> },
  { id: 3, name: "Monitors", icon: <MdMonitor /> },
  { id: 4, name: "Speakers", icon: <FaVolumeUp /> },
  { id: 5, name: "Headphones", icon: <FaHeadphones /> },
  { id: 6, name: "Cabinets", icon: <FaBox /> },
  { id: 7, name: "GPUs", icon: <FaFan /> },
  { id: 8, name: "CPUs", icon: <FaMicrochip /> },
  { id: 9, name: "Storage (RAM, ROM)", icon: <FaHdd /> },
 // { id: 10, name: "Power Supplies", icon: <FaBolt /> },
];

export default categories;
