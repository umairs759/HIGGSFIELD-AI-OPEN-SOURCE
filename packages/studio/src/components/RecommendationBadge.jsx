"use client";

import { useMemo } from 'react';

/**
 * RecommendationBadge - Displays contextual badges for models
 * 
 * Badges:
 * - [Free Credits Available] - Green badge for models with free tier
 * - [Best for Cinema] - Gold badge for cinematic models
 * - [Key Required] - Red badge when no API key is available
 * - [Fast] - Blue badge for fast models
 * - [High Quality] - Purple badge for quality models
 */

const BADGE_STYLES = {
  'free-credits': {
    bg: 'bg-green-500/20',
    border: 'border-green-500/50',
    text: 'text-green-400',
    icon: '🆓',
    label: 'Free Credits Available',
  },
  'best-cinema': {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/50',
    text: 'text-yellow-400',
    icon: '🎬',
    label: 'Best for Cinema',
  },
  'key-required': {
    bg: 'bg-red-500/20',
    border: 'border-red-500/50',
    text: 'text-red-400',
    icon: '🔑',
    label: 'Key Required',
  },
  'fast': {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/50',
    text: 'text-blue-400',
    icon: '⚡',
    label: 'Fast',
  },
  'high-quality': {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/50',
    text: 'text-purple-400',
    icon: '✨',
    label: 'High Quality',
  },
  'text-rendering': {
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/50',
    text: 'text-orange-400',
    icon: '📝',
    label: 'Best for Text',
  },
  'lipsync': {
    bg: 'bg-pink-500/20',
    border: 'border-pink-500/50',
    text: 'text-pink-400',
    icon: '🎙️',
    label: 'Lip Sync',
  },
};

function Badge({ variant, className = '' }) {
  const style = BADGE_STYLES[variant];
  if (!style) return null;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${style.bg} ${style.border} ${style.text} ${className}`}>
      <span>{style.icon}</span>
      <span>{style.label}</span>
    </span>
  );
}

/**
 * RecommendationBadge - Automatically determines badges from model tags and availability
 * @param {Object} props
 * @param {string} props.modelId - Model ID to get badges for
 * @param {Array<string>} [props.activeProviders] - Provider IDs with valid keys (optional, auto-detected)
 * @param {Array<string>} [props.customTags] - Override tags
 * @param {number} [props.maxBadges=3] - Maximum badges to show
 * @param {string} [props.className] - Additional className
 */
export default function RecommendationBadge({ 
  modelId, 
  activeProviders, 
  customTags, 
  maxBadges = 3,
  className = '',
}) {
  // Import dynamically to avoid circular deps
  const { getModelAvailability, getProvidersForModel } = require('../catalog/availability');
  const { hasKey } = require('../providers/keyStore');
  
  const badges = useMemo(() => {
    const model = getModelAvailability(modelId);
    if (!model) return [];
    
    const tags = customTags || model.tags || [];
    const providers = getProvidersForModel(modelId);
    const hasActiveKey = providers.some(p => activeProviders?.includes(p) || hasKey(p));
    
    const badgeVariants = [];
    
    // Map tags to badge variants
    const tagToVariant = {
      'free-tier': 'free-credits',
      'cinematic': 'best-cinema',
      'fast': 'fast',
      'high-quality': 'high-quality',
      'detail': 'high-quality',
      'typography': 'text-rendering',
      'text-rendering': 'text-rendering',
      'text': 'text-rendering',
      'lipsync': 'lipsync',
    };
    
    for (const tag of tags) {
      const variant = tagToVariant[tag];
      if (variant && !badgeVariants.includes(variant)) {
        badgeVariants.push(variant);
      }
    }
    
    // Add key required badge if no active key
    if (!hasActiveKey && !badgeVariants.includes('key-required')) {
      badgeVariants.push('key-required');
    }
    
    return badgeVariants.slice(0, maxBadges);
  }, [modelId, activeProviders, customTags, maxBadges]);
  
  if (badges.length === 0) return null;
  
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {badges.map(variant => (
        <Badge key={variant} variant={variant} />
      ))}
    </div>
  );
}

/**
 * Static badge component for manual badge display
 * @param {Object} props
 * @param {string|string[]} props.variants - Badge variant(s) to show
 * @param {string} [props.className]
 */
export function StaticBadges({ variants, className = '' }) {
  const variantArray = Array.isArray(variants) ? variants : [variants];
  
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {variantArray.map(variant => (
        <Badge key={variant} variant={variant} />
      ))}
    </div>
  );
}

export { BADGE_STYLES };