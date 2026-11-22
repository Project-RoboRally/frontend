'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { SECTIONS, SLIDES, type Block } from './slide';
import { buttonClassName, secondaryButtonClassName } from '@/lib/styles';

/**
 * Content for the tutorial slideshow (Only layout).
 * Also it's important you read 'slide.ts' first to get a better understanding of the structure
 *
 * @author Kerem
 */

const arrowButton = `${buttonClassName} disabled:cursor-not-allowed disabled:opacity-40`;
const panel =
  'flex min-h-0 flex-col overflow-y-auto rounded-lg border-2 border-cobber-dark bg-charcoal p-6 shadow-xl shadow-black/40';
const noteStyles = {
  warning: { box: 'border-amber bg-amber/10', title: 'Heads up' },
  joke: { box: 'border-amber bg-amber/10', title: 'Rivalry' },
  tip: { box: 'border-steel bg-steel/25', title: 'Tip' },
};

// Drawing all of the blocsk content for the slide (paragraph || list || note)
function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-4 text-bone/90">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'p':
            return (
              <p key={i} className="leading-relaxed">
                {block.text}
              </p>
            );
          case 'list': {
            const ListTag = block.ordered ? 'ol' : 'ul'; // numbered or point
            return (
              <ListTag key={i} className="space-y-2">
                {block.items.map((item, j) => (
                  <li key={j} className="border-l-4 border-cobber py-0.5 pl-3 leading-snug">
                    {block.ordered && (
                      <span className="mr-2 font-bold text-cobber-light">{j + 1}.</span>
                    )}
                    {/* or */}
                    {item}
                  </li>
                ))}
              </ListTag>
            );
          }
          case 'note': {
            const style = noteStyles[block.tone];
            return (
              <aside key={i} className={`rounded-md border-2 p-4 ${style.box}`}>
                <p className="mb-1 font-bold text-bone">{style.title}</p>
                <p className="leading-relaxed">{block.text}</p>
              </aside>
            );
          }
          case 'link':
            return (
              <p key={i} className="leading-relaxed">
                <a
                  className="font-bold text-cobber-light underline hover:text-bone"
                  href={block.href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {block.label}
                </a>
              </p>
            );
        }
      })}
    </div>
  );
}

export default function TutorialPage() {
  const router = useRouter();

  const [index, setIndex] = useState(0);
  const last = SLIDES.length - 1;
  const slide = SLIDES[index];
  const go = useCallback((next: number) => setIndex(Math.min(Math.max(next, 0), last)), [last]); // Go to the slide, but never before the first and after the last slide
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft') go(index - 1);
      if (event.key == 'ArrowRight') go(index + 1);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown); // So there isn't a duplicate listener everytime the index chagnes
  }, [go, index]); // So we don't go back to index 0 everytime we click on the arrows (remembers the values)

  const text = (
    <article className={`${panel} ${slide.image ? '' : 'w-full max-w-3xl'}`}>
      {' '}
      {/* if there is a picture on the slide dont hardcode the size, else hardcode it to fill the slide */}
      <h2 className="mb-4 text-2xl font-bold text-bone">{slide.title}</h2>
      <Blocks blocks={slide.blocks} />
    </article>
  );

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-screen-2xl flex-1 flex-col gap-4 p-4 md:p-6">
      {/* --- Top side (section + index + back button) --- */}
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">RoboRally tutorial</h1>
          <p className="text-sm text-bone/70">
            {SECTIONS[slide.section]}, slide {index + 1} of {SLIDES.length}
          </p>
        </div>
        <button
          className={secondaryButtonClassName}
          onClick={() => router.push('/main-menu')}
          type="button"
        >
          Back to menu
        </button>
      </header>

      {/* --- Middle side (slide) --- */}
      {slide.image ? (
        <section className="grid min-h-0 flex-1 gap-4 overflow-y-auto lg:grid-cols-[7fr_3fr] lg:overflow-visible">
          <div className="relative min-h-56">
            <Image
              alt={slide.title}
              className="object-contain"
              fill
              sizes="(min-width: 1024px) 70vw, 100vw"
              src={slide.image}
            />
          </div>
          {text}
        </section>
      ) : (
        <section className="flex min-h-0 flex-1 justify-center">{text}</section>
      )}

      {/* --- Bottom side (arrows + progress) --- */}
      <footer className="space-y-3">
        {/* Progress bar: fills up as you move through the slides */}
        <div className="h-2 w-full rounded-sm bg-iron">
          <div
            className="h-2 rounded-sm bg-cobber-light transition-all"
            style={{ width: `${((index + 1) / SLIDES.length) * 100}%` }} // @author Claude
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Previous is disabled on the first slide */}
          <button
            className={arrowButton}
            disabled={index === 0}
            onClick={() => go(index - 1)}
            type="button"
          >
            ← Previous
          </button>

          {/* On the last slide, Next becomes a button back to the main menu */}
          {index === last ? (
            <button
              className={buttonClassName}
              onClick={() => router.push('/main-menu')}
              type="button"
            >
              Back to Main Menu
            </button>
          ) : (
            <button className={arrowButton} onClick={() => go(index + 1)} type="button">
              Next →
            </button>
          )}
        </div>
      </footer>
    </main>
  );
}
