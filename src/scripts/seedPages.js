import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Page } from '../models/Page.model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pages = [
  {
    slug: 'about',
    title: 'About Us',
    status: 'PUBLISHED',
    placement: 'FOOTER',
    seo: {
      meta_title: 'About Zozo',
      meta_description:
        'Learn about Zozo — Pakistan\'s destination for mobile phone prices, specifications, comparisons and reviews.',
    },
    body: `
      <p>Welcome to <strong>Zozo</strong>, Pakistan's go-to platform for discovering, comparing and buying mobile phones.</p>
      <p>We bring together up-to-date prices, detailed specifications, side-by-side comparisons and honest reviews so you can make a confident buying decision — all in one place.</p>
      <h2>What we do</h2>
      <ul>
        <li>Track the latest mobile phone prices across retailers in Pakistan.</li>
        <li>Provide complete specifications for thousands of devices.</li>
        <li>Let you compare phones side by side to find the best fit.</li>
        <li>Publish news, reviews and buying guides to keep you informed.</li>
      </ul>
      <p>Our goal is simple: help you find the right phone at the right price.</p>
    `,
  },
  {
    slug: 'contact',
    title: 'Contact Us',
    status: 'PUBLISHED',
    placement: 'FOOTER',
    seo: {
      meta_title: 'Contact Zozo',
      meta_description: 'Get in touch with the Zozo team for support, feedback or business enquiries.',
    },
    body: `
      <p>We'd love to hear from you. Whether you have a question, feedback, or a business enquiry, reach out using the details below.</p>
      <h2>Get in touch</h2>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:support@zozo.pk">support@zozo.pk</a></li>
        <li><strong>Business enquiries:</strong> <a href="mailto:info@zozo.pk">info@zozo.pk</a></li>
      </ul>
      <p>We aim to respond to all messages within 1–2 business days.</p>
    `,
  },
  {
    slug: 'terms',
    title: 'Terms and Conditions',
    status: 'PUBLISHED',
    placement: 'FOOTER',
    seo: {
      meta_title: 'Terms and Conditions | Zozo',
      meta_description: 'Read the terms and conditions that govern the use of the Zozo website.',
    },
    body: `
      <p>By accessing and using Zozo, you agree to the following terms and conditions. Please read them carefully.</p>
      <h2>Use of the website</h2>
      <p>Zozo provides mobile phone prices, specifications and comparisons for informational purposes only. While we strive for accuracy, prices and specifications may change without notice and are not guaranteed.</p>
      <h2>Pricing information</h2>
      <p>Prices shown are collected from various retailers and may differ from the final price at the point of sale. Zozo is not responsible for any discrepancies or for transactions carried out with third-party retailers.</p>
      <h2>Intellectual property</h2>
      <p>All content on this website, including text, graphics and logos, is the property of Zozo or its content suppliers and is protected by applicable laws. Brand names and logos belong to their respective owners.</p>
      <h2>Limitation of liability</h2>
      <p>Zozo shall not be liable for any direct or indirect damages arising from the use of, or inability to use, this website.</p>
      <h2>Changes to these terms</h2>
      <p>We may update these terms from time to time. Continued use of the website constitutes acceptance of the revised terms.</p>
    `,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    for (const p of pages) {
      const existing = await Page.findOne({ slug: p.slug });
      if (existing) {
        // Only fill in content if it's missing/unpublished; don't clobber edits.
        if (existing.status !== 'PUBLISHED' || !existing.body) {
          existing.title = existing.title || p.title;
          existing.body = existing.body || p.body;
          existing.status = 'PUBLISHED';
          existing.placement = existing.placement === 'NONE' ? p.placement : existing.placement;
          await existing.save();
          console.log(`Updated page: ${p.slug}`);
        } else {
          console.log(`Page already exists (skipped): ${p.slug}`);
        }
      } else {
        await Page.create(p);
        console.log(`Created page: ${p.slug}`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
