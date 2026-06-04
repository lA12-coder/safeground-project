'use client';

import Image from 'next/image';
import { Globe, Laptop, User } from 'lucide-react';
import type { DirectoryProvider } from '@/lib/directory/types';

type ProviderCardProps = {
  provider: DirectoryProvider;
  onAction: (provider: DirectoryProvider) => void;
};

export function ProviderCard({ provider, onAction }: ProviderCardProps) {
  const isFaith = provider.badge === 'faith';

  return (
    <article className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm flex flex-col">
      <div className="relative h-44 w-full bg-surface-container">
        <Image
          src={provider.imageUrl}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width:768px) 100vw, 33vw"
          unoptimized
        />
        <span
          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${
            isFaith ? 'bg-primary text-on-primary' : 'bg-secondary text-on-secondary'
          }`}
        >
          {isFaith ? 'Faith Support' : 'Verified'}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-grow space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-xl font-bold text-on-surface leading-tight">
            {provider.name}
          </h3>
          <span className="shrink-0 text-[10px] font-bold tracking-wider text-on-surface-variant bg-surface-container px-2 py-1 rounded">
            {provider.typeLabel}
          </span>
        </div>

        <p className="flex items-center gap-1.5 text-sm text-secondary font-medium">
          <Globe className="w-4 h-4 shrink-0" aria-hidden />
          {provider.languages.join(', ')}
        </p>

        <p className="text-sm text-on-surface-variant line-clamp-2 leading-relaxed">{provider.bio}</p>

        <div className="flex items-center justify-between pt-2 mt-auto">
          <span
            className={`font-semibold text-sm ${
              provider.priceHighlight === 'green' ? 'text-secondary' : 'text-primary'
            }`}
          >
            {provider.price}
          </span>
          <span className="flex items-center gap-1 text-xs text-on-surface-variant">
            {provider.mode === 'in-person' ? (
              <User className="w-4 h-4" aria-hidden />
            ) : (
              <Laptop className="w-4 h-4" aria-hidden />
            )}
            {provider.modeLabel}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onAction(provider)}
          className={
            provider.cta === 'join'
              ? 'w-full py-3 rounded-lg border-2 border-secondary text-secondary font-semibold hover:bg-secondary-container/30 transition-colors'
              : 'w-full py-3 rounded-lg bg-primary text-on-primary font-semibold hover:opacity-90 transition-opacity'
          }
        >
          {provider.cta === 'join' ? 'Join Program' : 'Book Session'}
        </button>
      </div>
    </article>
  );
}
