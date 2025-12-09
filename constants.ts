import { ServiceOffer } from './types';

export const SERVICE_OFFERS: ServiceOffer[] = [
  {
    id: 'check',
    title: 'Website Check',
    price: '$27',
    description: 'A complete mini-audit of the client’s website.',
    color: 'bg-blue-50 border-blue-200 text-blue-900',
    features: [
      'Design & UX analysis',
      'Speed & Mobile check',
      'SEO basics review',
      'Broken element detection',
      'PDF Report included'
    ]
  },
  {
    id: 'fix',
    title: 'Quick Fix',
    price: '$79',
    description: 'Fix major issues found during the website check.',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    features: [
      'Layout correction',
      'Speed optimization',
      'Button/Link fixes',
      'Mobile view enhancement',
      'Basic SEO fixes'
    ]
  },
  {
    id: 'build',
    title: 'New Website Build',
    price: '$249',
    description: 'Fully modern, fast, mobile-friendly website.',
    color: 'bg-purple-50 border-purple-200 text-purple-900',
    features: [
      'Built from scratch',
      'Mobile-responsive',
      'Essential pages (Home, About, etc.)',
      'Clean design',
      '3-5 day delivery'
    ]
  },
  {
    id: 'care',
    title: 'Monthly Website Care',
    price: '$29/mo',
    description: 'Ongoing support to keep the site running smoothly.',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    features: [
      'Monthly edits',
      'Speed checks',
      'Security monitoring',
      'Content updates',
      'Priority support'
    ]
  }
];

export const LEAD_COUNTS = [10, 20, 50, 100];
