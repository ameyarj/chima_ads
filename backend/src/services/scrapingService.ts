import puppeteer from 'puppeteer';
import axios from 'axios';
import { ProductData, ScrapingResult } from '@shared/types';

export class ScrapingService {
  private async isShopifyStore(url: string): Promise<boolean> {
    try {
      const response = await axios.get(url, { timeout: 10000 });
      const html = response.data;
      return html.includes('Shopify') || html.includes('shopify') || html.includes('cdn.shopify.com');
    } catch {
      return false;
    }
  }

  private async isAmazonProduct(url: string): Promise<boolean> {
    return url.includes('amazon.') && (url.includes('/dp/') || url.includes('/gp/product/'));
  }

  private async scrapeShopify(url: string): Promise<ProductData> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      const productData = await page.evaluate(() => {
        const title = document.querySelector('h1')?.textContent?.trim() || 
                     document.querySelector('.product-title')?.textContent?.trim() || 
                     document.querySelector('[data-testid="product-title"]')?.textContent?.trim() || '';
        
        const description = document.querySelector('.product-description')?.textContent?.trim() || 
                           document.querySelector('.product__description')?.textContent?.trim() || 
                           document.querySelector('[data-testid="product-description"]')?.textContent?.trim() || '';
        
        const price = document.querySelector('.price')?.textContent?.trim() || 
                     document.querySelector('.product-price')?.textContent?.trim() || 
                     document.querySelector('[data-testid="price"]')?.textContent?.trim() || '';
        
        const images: string[] = [];
        
        const shopifyImages = document.querySelectorAll(`
          img[src*="product"], img[alt*="product"], 
          .product-image img, .product__media img, .product__photo img,
          .product-single__photo img, .product-form__image img,
          .featured-image img, .product-gallery img,
          [data-zoom] img, .zoomContainer img,
          .slick-slide img, .swiper-slide img
        `);
        
        shopifyImages.forEach(img => {
          const src = (img as HTMLImageElement).src;
          if (src && !src.includes('data:') && !src.includes('logo') && !src.includes('icon') && !images.includes(src)) {
            images.push(src);
          }
        });
        
        if (images.length === 0) {
          const allImages = document.querySelectorAll('img');
          const candidateImages: Array<{src: string, size: number}> = [];
          
          allImages.forEach(img => {
            const src = (img as HTMLImageElement).src;
            const alt = (img as HTMLImageElement).alt?.toLowerCase() || '';
            
            if (src && !src.includes('data:') && !src.includes('logo') && !src.includes('icon') && !alt.includes('logo')) {
              const width = (img as HTMLImageElement).naturalWidth || (img as HTMLImageElement).width;
              const height = (img as HTMLImageElement).naturalHeight || (img as HTMLImageElement).height;
              const size = width * height;
              
              if (size > 15000) { 
                candidateImages.push({src, size});
              }
            }
          });
          
          candidateImages.sort((a, b) => b.size - a.size);
          candidateImages.slice(0, 5).forEach(img => {
            if (!images.includes(img.src)) {
              images.push(img.src);
            }
          });
        }
        
        const featureElements = document.querySelectorAll('.product-features li, .features li, .product-details li, ul li');
        const features: string[] = [];
        featureElements.forEach(el => {
          const text = el.textContent?.trim();
          if (text && text.length > 5 && text.length < 100) {
            features.push(text);
          }
        });
        
        return {
          title,
          description: description.substring(0, 500), 
          price,
          images: images.slice(0, 5), 
          features: features.slice(0, 5) 
        };
      });
      
      return {
        url,
        title: productData.title,
        description: productData.description,
        price: productData.price,
        images: productData.images,
        features: productData.features,
        category: 'shopify'
      };
    } finally {
      await browser.close();
    }
  }

  private async scrapeAmazon(url: string): Promise<ProductData> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      const productData = await page.evaluate(() => {
        const title = document.querySelector('#productTitle')?.textContent?.trim() || '';
        
        const description = document.querySelector('#feature-bullets ul')?.textContent?.trim() || 
                           document.querySelector('#productDescription')?.textContent?.trim() || '';
        
        const price = document.querySelector('.a-price-whole')?.textContent?.trim() || 
                     document.querySelector('.a-price')?.textContent?.trim() || '';
        
        const imageElements = document.querySelectorAll('#landingImage, .a-dynamic-image, #imgTagWrapperId img');
        const images: string[] = [];
        imageElements.forEach(img => {
          const src = (img as HTMLImageElement).src;
          if (src && !src.includes('data:') && !images.includes(src)) {
            images.push(src);
          }
        });
        
        const featureElements = document.querySelectorAll('#feature-bullets li, .a-unordered-list li');
        const features: string[] = [];
        featureElements.forEach(el => {
          const text = el.textContent?.trim();
          if (text && text.length > 10 && text.length < 200 && !text.includes('Make sure')) {
            features.push(text);
          }
        });
        
        return {
          title,
          description: description.substring(0, 500),
          price,
          images: images.slice(0, 5),
          features: features.slice(0, 5)
        };
      });
      
      return {
        url,
        title: productData.title,
        description: productData.description,
        price: productData.price,
        images: productData.images,
        features: productData.features,
        category: 'amazon'
      };
    } finally {
      await browser.close();
    }
  }

  private async scrapeGeneric(url: string): Promise<ProductData> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      const productData = await page.evaluate(() => {
        const title = document.querySelector('h1')?.textContent?.trim() || 
                     document.querySelector('.product-title')?.textContent?.trim() || 
                     document.querySelector('[data-testid="product-title"]')?.textContent?.trim() || 
                     document.title || '';
        
        const description = document.querySelector('.product-description')?.textContent?.trim() || 
                           document.querySelector('.description')?.textContent?.trim() || 
                           document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
        
        const price = document.querySelector('.price')?.textContent?.trim() || 
                     document.querySelector('.product-price')?.textContent?.trim() || 
                     document.querySelector('[class*="price"]')?.textContent?.trim() || '';
        
        const images: string[] = [];
        
        const productImages = document.querySelectorAll(`
          img[src*="product"], img[alt*="product"], 
          .product-image img, .product-gallery img, .product__media img,
          [class*="product"] img, [data-testid*="product"] img,
          .gallery img, .slider img, .carousel img,
          .main-image img, .hero-image img
        `);
        
        productImages.forEach(img => {
          const src = (img as HTMLImageElement).src;
          if (src && !src.includes('data:') && !src.includes('logo') && !src.includes('icon') && !images.includes(src)) {
            images.push(src);
          }
        });
        
        if (images.length === 0) {
          const allImages = document.querySelectorAll('img');
          const candidateImages: Array<{src: string, size: number}> = [];
          
          allImages.forEach(img => {
            const src = (img as HTMLImageElement).src;
            const alt = (img as HTMLImageElement).alt?.toLowerCase() || '';
            const className = (img as HTMLImageElement).className?.toLowerCase() || '';
            
            if (src && !src.includes('data:') && 
                !src.includes('logo') && !src.includes('icon') && 
                !src.includes('avatar') && !src.includes('badge') &&
                !alt.includes('logo') && !alt.includes('icon') &&
                !className.includes('logo') && !className.includes('icon')) {
              
              const width = (img as HTMLImageElement).naturalWidth || (img as HTMLImageElement).width;
              const height = (img as HTMLImageElement).naturalHeight || (img as HTMLImageElement).height;
              const size = width * height;
              
              if (size > 10000) { 
                candidateImages.push({src, size});
              }
            }
          });
          
          candidateImages.sort((a, b) => b.size - a.size);
          candidateImages.slice(0, 5).forEach(img => {
            if (!images.includes(img.src)) {
              images.push(img.src);
            }
          });
        }
        
        if (images.length === 0) {
          const fallbackImages = document.querySelectorAll('img[src]');
          fallbackImages.forEach(img => {
            const src = (img as HTMLImageElement).src;
            const alt = (img as HTMLImageElement).alt?.toLowerCase() || '';
            
            if (src && !src.includes('data:') && 
                !src.includes('logo') && !src.includes('icon') && 
                !alt.includes('logo') && !alt.includes('icon') &&
                images.length < 3) {
              images.push(src);
            }
          });
        }
        
        const featureElements = document.querySelectorAll('ul li, .features li, .specs li');
        const features: string[] = [];
        featureElements.forEach(el => {
          const text = el.textContent?.trim();
          if (text && text.length > 5 && text.length < 150) {
            features.push(text);
          }
        });
        
        return {
          title,
          description: description.substring(0, 500),
          price,
          images: images.slice(0, 5),
          features: features.slice(0, 5)
        };
      });
      
      return {
        url,
        title: productData.title,
        description: productData.description,
        price: productData.price,
        images: productData.images,
        features: productData.features,
        category: 'generic'
      };
    } finally {
      await browser.close();
    }
  }

  async scrapeProduct(url: string): Promise<ScrapingResult> {
    try {
      console.log(`Starting to scrape: ${url}`);
      
      let productData: ProductData;
      
      if (await this.isAmazonProduct(url)) {
        console.log('Detected Amazon product');
        productData = await this.scrapeAmazon(url);
      } else if (await this.isShopifyStore(url)) {
        console.log('Detected Shopify store');
        productData = await this.scrapeShopify(url);
      } else {
        console.log('Using generic scraper');
        productData = await this.scrapeGeneric(url);
      }
      
      if (!productData.title || productData.title.length < 3) {
        throw new Error('Could not extract product title');
      }
      
      console.log(`Successfully scraped product: ${productData.title}`);
      
      return {
        success: true,
        data: productData
      };
    } catch (error) {
      console.error('Scraping error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown scraping error'
      };
    }
  }
}

export const scrapingService = new ScrapingService();
