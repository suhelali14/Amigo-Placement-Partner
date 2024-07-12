import { Button } from "@/components/ui/button";
import Image from "next/image";
import Header from "./dashboard/_components/Header";
import { AtomIcon, Edit, Share2 } from "lucide-react";

export default function Home() {
  return (
    <div>
      <Image src={'/grid.svg'} className="absolute z-[-10] w-full" 
      width={1200} height={300} />
      <Header/>
      <div>
          <h1>We are in Development Phase So you will have early access and vesrion 1 of App</h1>
      </div>
  </div>
 

  );
}
