"use client";

import Image from "next/image";
import { useState } from "react";
import Modal from "./Modal";

export default function PhotoGallery({
  images,
  title,
}: {
  images: { url: string }[];
  title: string;
}) {
  const [showAll, setShowAll] = useState(false);
  const urls = images.map((i) => i.url);
  const main = urls[0];
  const rest = urls.slice(1, 5);

  return (
    <>
      <div className="relative grid grid-cols-1 gap-2 overflow-hidden rounded-xl md:grid-cols-4 md:grid-rows-2">
        <button
          className="relative col-span-2 row-span-2 aspect-square md:aspect-auto md:h-full"
          onClick={() => setShowAll(true)}
        >
          <Image
            src={main}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition hover:brightness-95"
            priority
          />
        </button>
        {rest.map((url, i) => (
          <button
            key={i}
            className="relative hidden aspect-square md:block"
            onClick={() => setShowAll(true)}
          >
            <Image
              src={url}
              alt={`${title} photo ${i + 2}`}
              fill
              sizes="25vw"
              className="object-cover transition hover:brightness-95"
            />
          </button>
        ))}
        <button
          onClick={() => setShowAll(true)}
          className="absolute bottom-4 right-4 rounded-lg border border-gray-dark bg-white px-4 py-1.5 text-sm font-medium shadow hover:bg-gray-50"
        >
          Show all photos
        </button>
      </div>

      <Modal open={showAll} onClose={() => setShowAll(false)} title="All photos" wide>
        <div className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2">
          {urls.map((url, i) => (
            <div key={i} className="relative aspect-[4/3]">
              <Image
                src={url}
                alt={`${title} photo ${i + 1}`}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="rounded-lg object-cover"
              />
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
