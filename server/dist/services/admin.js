// Admin service — password auth, JWT, SiteData↔SiteConfig conversion
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getProject, updateProject } from './supabase.js';
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const JWT_EXPIRES_IN = '7d';
const SALT_ROUNDS = 10;
const PASSWORD_LENGTH = 8;
// --- Password Generation ---
/** Generate a random alphanumeric password */
export function generatePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'; // no ambiguous chars
    let password = '';
    const bytes = crypto.randomBytes(PASSWORD_LENGTH);
    for (let i = 0; i < PASSWORD_LENGTH; i++) {
        password += chars[bytes[i] % chars.length];
    }
    return password;
}
/** Hash a password with bcrypt */
export async function hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
}
/** Set edit password for a project (auto-generates if not provided) */
export async function setEditPassword(projectId, password) {
    const plainPassword = password || generatePassword();
    const hash = await hashPassword(plainPassword);
    await updateProject(projectId, {
        edit_password_hash: hash,
        edit_password_plain: plainPassword,
    });
    return { password: plainPassword, hash };
}
/** Create a JWT for a project */
export function createJwt(projectId, slug) {
    return jwt.sign({ projectId, slug }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
}
/** Verify and decode a JWT */
export function verifyJwt(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    }
    catch {
        return null;
    }
}
// --- Login ---
/** Attempt login with password, returns JWT on success */
export async function loginAdmin(projectId, password) {
    const project = await getProject(projectId);
    if (!project)
        return null;
    const hash = project.edit_password_hash;
    if (!hash)
        return null;
    const valid = await bcrypt.compare(password, hash);
    if (!valid)
        return null;
    const slug = project.site_config?.meta?.slug || projectId;
    const token = createJwt(projectId, slug);
    return {
        token,
        projectName: project.name,
        slug,
    };
}
/** Verify JWT and check project exists */
export async function verifyAdminAccess(projectId, token) {
    const payload = verifyJwt(token);
    if (!payload || payload.projectId !== projectId) {
        return { valid: false };
    }
    const project = await getProject(projectId);
    if (!project)
        return { valid: false };
    return {
        valid: true,
        projectName: project.name,
        slug: payload.slug,
    };
}
/** Convert layout array to blockVariants record */
function layoutToVariants(layout) {
    const variants = {};
    for (const block of layout) {
        variants[block.type] = block.variant;
    }
    return variants;
}
/** Convert admin-edited SiteData back to SiteConfig for rebuild */
export function siteDataToConfig(existing, payload) {
    const { siteData, layout, theme, contacts } = payload;
    return {
        ...existing,
        brand: {
            ...existing.brand,
            name: siteData.brand?.name || existing.brand.name,
            tagline: siteData.brand?.tagline || existing.brand.tagline,
            heroTitle: siteData.hero?.heroTitle || existing.brand.heroTitle,
            heroSubtitle: siteData.hero?.heroSubtitle || existing.brand.heroSubtitle,
            heroDescription: siteData.hero?.heroDescription || existing.brand.heroDescription,
            heroQuote: siteData.hero?.heroQuote || existing.brand.heroQuote,
        },
        sections: {
            ...existing.sections,
            // Hero advantages
            heroAdvantages: siteData.hero?.advantages || existing.sections.heroAdvantages,
            // Directions
            directions: (siteData.directions?.directions || existing.sections.directions).map((d) => ({
                id: d.id,
                title: d.title,
                image: d.image,
                description: d.description,
                tags: d.tags || [],
                level: d.level || '',
                duration: d.duration || '',
                category: d.category || 'body',
                complexity: d.complexity,
                buttonText: d.buttonText,
            })),
            // Instructors
            instructors: (siteData.instructors?.instructors || existing.sections.instructors).map((i) => ({
                name: i.name,
                image: i.image,
                specialties: i.specialties || [],
                experience: i.experience || '',
                style: i.style || '',
            })),
            // Stories
            stories: (siteData.stories?.stories || existing.sections.stories).map((s) => ({
                beforeImg: s.beforeImg,
                afterImg: s.afterImg,
                title: s.title,
                description: s.description,
            })),
            // FAQ
            faq: (siteData.faq?.items || existing.sections.faq).map((f) => ({
                question: f.question,
                answer: f.answer,
            })),
            // Requests
            requests: (siteData.requests?.rows || existing.sections.requests)
                .flat()
                .map((r) => ({
                text: r.text,
                image: r.image || '',
            })),
            // Objections
            objections: (siteData.objections?.pairs || existing.sections.objections).map((o) => ({
                myth: o.myth,
                answer: o.answer,
            })),
            // Advantages
            advantages: (siteData.advantages?.advantages || existing.sections.advantages).map((a) => ({
                title: a.title,
                text: a.text,
                image: a.image,
            })),
            // Director
            director: siteData.director ? {
                name: siteData.director.name,
                title: siteData.director.title,
                description: siteData.director.description,
                achievements: siteData.director.achievements || [],
                image: siteData.director.image,
            } : existing.sections.director,
            // Contacts
            contacts: {
                ...existing.sections.contacts,
                ...contacts,
            },
            // Pricing
            pricing: (siteData.pricing?.plans || existing.sections.pricing).map((p) => ({
                name: p.name,
                price: p.price,
                period: p.validity || p.period || '',
                features: p.features || [],
                highlighted: p.isPopular || p.highlighted || false,
                category: p.targetAudience || p.category || '',
            })),
            // Reviews
            reviews: (siteData.reviews?.reviews || existing.sections.reviews).map((r) => ({
                name: r.name,
                text: r.text,
                source: r.source,
                rating: r.rating,
            })),
            // Gallery
            gallery: siteData.gallery?.images || existing.sections.gallery,
            // Quiz
            quiz: siteData.quiz ? {
                managerName: siteData.quiz.managerName,
                managerImage: siteData.quiz.managerImage,
                tips: siteData.quiz.tips || [],
                steps: (siteData.quiz.steps || []).map((s) => ({
                    question: s.question,
                    options: s.options,
                })),
            } : existing.sections.quiz,
            // Atmosphere
            atmosphere: (siteData.atmosphere?.items || existing.sections.atmosphere).map((a) => ({
                title: a.title,
                description: a.description,
                image: a.image,
            })),
            // Section titles
            sectionTitles: {
                ...existing.sections.sectionTitles,
                directions: {
                    title: siteData.directions?.title || existing.sections.sectionTitles?.directions?.title || 'Направления',
                    subtitle: siteData.directions?.subtitle || existing.sections.sectionTitles?.directions?.subtitle || '',
                },
                pricing: {
                    title: siteData.pricing?.title || existing.sections.sectionTitles?.pricing?.title || 'Тарифы',
                    subtitle: siteData.pricing?.subtitle || existing.sections.sectionTitles?.pricing?.subtitle || '',
                },
                calculator: existing.sections.sectionTitles?.calculator || {
                    title: 'Как меняется тело',
                    subtitle: 'Трансформация',
                    buttonText: 'Начать',
                },
            },
            // Block variants from layout
            blockVariants: layoutToVariants(layout),
            // Theme
            colorScheme: theme.colorScheme,
        },
    };
}
/** Save admin edits (draft — no rebuild) */
export async function saveAdminEdits(projectId, payload) {
    const project = await getProject(projectId);
    if (!project)
        throw new Error('Project not found');
    const existingConfig = project.site_config;
    if (!existingConfig)
        throw new Error('No site config found');
    const updatedConfig = siteDataToConfig(existingConfig, payload);
    await updateProject(projectId, {
        site_config: updatedConfig,
    });
    console.log(`💾 Admin edits saved for project ${projectId}`);
}
