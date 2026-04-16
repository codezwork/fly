import { MetadataRoute } from 'next';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://flystore.site';
  
  // Base routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/manifesto`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/concierge`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  try {
    // Fetch products
    const productsSnap = await getDocs(collection(db, 'products'));
    const productRoutes: MetadataRoute.Sitemap = productsSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        url: `${baseUrl}/products/${data.handle}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      };
    });

    // Fetch collections
    const collectionsSnap = await getDocs(collection(db, 'collections'));
    const collectionRoutes: MetadataRoute.Sitemap = collectionsSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        url: `${baseUrl}/collections/${data.handle}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      };
    });

    return [...routes, ...productRoutes, ...collectionRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return routes;
  }
}
