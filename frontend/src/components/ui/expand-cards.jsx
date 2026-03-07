"use client";

import { useState } from "react";

const teamMembers = [
  { image: "/images/alpha.png", name: "Alpha Guyasa", role: "Penetration Tester" },
  { image: "/images/abdi.png", name: "Abdi Fekeda", role: "Full Stack Developer" },
  { image: "/images/milkesa.png", name: "Milkesa Eshetu", role: "Mobile App Developer" },
  { image: "/images/kenesa.png", name: "Kenesa Asfaw", role: "AI Engineer" },
];

const ExpandOnHover = () => {
  const [expandedImage, setExpandedImage] = useState(1);

  const getImageWidth = (index) =>
    index === expandedImage ? "24rem" : "5rem";

  return (
    <div className="w-full h-screen bg-transparent">
      <div
        className="relative grid min-h-screen grid-cols-1 items-center justify-center p-2 transition-all duration-300 ease-in-out lg:flex w-full">
        <div className="w-full h-full overflow-hidden rounded-3xl">
          <div
            className="flex h-full w-full items-center justify-center overflow-hidden bg-transparent">
            <div className="relative w-full max-w-6xl px-5">
              <div className="flex w-full items-center justify-center gap-1">
                {teamMembers.map((member, idx) => (
                  <div
                    key={idx}
                    className="relative cursor-pointer overflow-hidden rounded-3xl transition-all duration-500 ease-in-out"
                    style={{
                      width: getImageWidth(idx + 1),
                      height: "24rem",
                    }}
                    onMouseEnter={() => setExpandedImage(idx + 1)}>
                    <img className="w-full h-full object-cover" src={member.image} alt={member.name} />
                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
                      <h4 className="font-bold">{member.name}</h4>
                      <p className="text-sm">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpandOnHover;
