-- Migration: 20260902010000_seed_five_seo_blog_posts.sql
-- Description: Seed 5 high-impact, SEO-optimized blog posts targeting core keywords and beating sie-b.org

DO $$
DECLARE
  v_cat_guidance uuid;
  v_cat_halal uuid;
BEGIN
  -- 1. Ensure Categories Exist
  SELECT id INTO v_cat_guidance FROM public.blog_categories WHERE slug = 'বনয়গ-সদধনতর-নরদশক' OR name ILIKE '%নির্দেশিকা%' LIMIT 1;
  IF v_cat_guidance IS NULL THEN
    INSERT INTO public.blog_categories (name, slug) 
    VALUES ('বিনিয়োগ সিদ্ধান্তের নির্দেশিকা', 'biniyog-shiddhanto-nirdeshika')
    RETURNING id INTO v_cat_guidance;
  END IF;

  SELECT id INTO v_cat_halal FROM public.blog_categories WHERE slug = 'halal-investment' OR name ILIKE '%Halal%' LIMIT 1;
  IF v_cat_halal IS NULL THEN
    INSERT INTO public.blog_categories (name, slug) 
    VALUES ('Halal Investment', 'halal-investment')
    RETURNING id INTO v_cat_halal;
  END IF;

  -- 2. Post 1: বিনিয়োগ বৃদ্ধি কি? বাংলাদেশে ব্যবসায় বিনিয়োগের সম্পূর্ণ গাইড
  INSERT INTO public.blog_posts (
    title,
    slug,
    excerpt,
    content_html,
    category_id,
    status,
    author_name,
    meta_title,
    meta_description,
    published_at,
    created_at,
    updated_at
  ) VALUES (
    'বিনিয়োগ বৃদ্ধি কি? বাংলাদেশে ব্যবসায় বিনিয়োগের সম্পূর্ণ গাইড',
    'biniyog-briddhi-ki-bangladesh-business-investment-guide',
    'বিনিয়োগ বৃদ্ধি কি এবং কেন এটি বাংলাদেশে সাধারণ মানুষের জন্য সবচেয়ে নির্ভরযোগ্য সুদমুক্ত ব্যবসায়িক প্ল্যাটফর্ম? sie-b.org এর সাথে পার্থক্য এবং সফল ব্যবসায় সরাসরি বিনিয়োগের পূর্ণাঙ্গ নির্দেশিকা জানুন।',
    '<div class="blog-content space-y-6">
      <p class="lead text-lg text-foreground/90 font-medium">
        বর্তমান সময়ে বাংলাদেশে সঞ্চয় ধরে রাখা এবং তা থেকে হালাল ও লাভজনক রিটার্ন পাওয়া সাধারণ বিনিয়োগকারীদের জন্য সবচেয়ে বড় চ্যালেঞ্জ। 
        এই প্রেক্ষাপটে <strong>বিনিয়োগ বৃদ্ধি (Biniyog Briddhi)</strong> একটি আধুনিক, নির্ভরযোগ্য এবং সম্পূর্ণ সুদমুক্ত অংশীদারিত্বমূলক ব্যবসায়িক প্ল্যাটফর্ম হিসেবে আত্মপ্রকাশ করেছে।
      </p>

      <h2 class="text-2xl font-bold text-foreground mt-8 mb-4">১. বিনিয়োগ বৃদ্ধি কি? (What is Biniyog Briddhi?)</h2>
      <p>
        <strong>বিনিয়োগ বৃদ্ধি</strong> হলো একটি স্বচ্ছ ব্যবসায়িক প্ল্যাটফর্ম যা সম্ভাবনাময়, লাভজনক এবং বাস্তব ক্ষুদ্র-মাঝারি উদ্যোগগুলোর (SMEs) সাথে সরাসরি বিনিয়োগকারীদের সংযুক্ত করে। 
        এখানে কোনো প্রকার সুদের লেনদেন হয় না; বরং প্রকৃত লাভ-ক্ষতির অংশীদারিত্বের (Mudarabah/Musharakah) ভিত্তিতে বিনিয়োগ পরিচালিত হয়।
      </p>
      <p>
        ঢাকা বিশ্ববিদ্যালয়ের আইবিএ (IBA) এবং ইউরোপের খ্যাতনামা বিশ্ববিদ্যালয়ে শিক্ষিত আন্তর্জাতিক <strong>CFA (Chartered Financial Analyst) চার্টারহোল্ডার মোহাইমিন পাটোয়ারী</strong> এর নেতৃত্বে এই প্ল্যাটফর্মটি পরিচালিত হয়। 
        এখানে প্রতিটি ব্যবসা কঠোর আর্থিক বিশ্লেষণ ও আইনি যাচাই-বাছাই পেরিয়ে বিনিয়োগের জন্য উন্মুক্ত করা হয়।
      </p>

      <div class="my-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
        <h3 class="text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-2">💡 বিনিয়োগ বৃদ্ধির মূল রূপকল্প:</h3>
        <ul class="list-disc list-inside space-y-1 text-sm text-foreground/85">
          <li><strong>সুদমুক্ত অর্থনীতি:</strong> সুদী ব্যাংকিং ব্যবস্থা থেকে বেরিয়ে এসে সরাসরি উৎপাদনশীল ব্যবসায় মূলধন নিয়োগ।</li>
          <li><strong>ব্যবসায়ীর সাথে সরাসরি সংযোগ:</strong> কোনো থার্ড-পার্টি বা মধ্যস্বত্বভোগী নেই।</li>
          <li><strong>স্বচ্ছ লিগ্যাল সুরক্ষা:</strong> সরকারি স্ট্যাম্পে চুক্তিপত্র ও সিকিউরিটি চেক প্রদান।</li>
          <li><strong>মাসিক ও ত্রৈমাসিক অডিট:</strong> প্রতিটি ব্যবসার বাস্তব সেলস ও ক্যাশ-ফ্লো বিনিয়োগকারীদের সামনে উন্মোচন।</li>
        </ul>
      </div>

      <h2 class="text-2xl font-bold text-foreground mt-8 mb-4">২. sie-b.org বনাম biniyogbriddhi.com — পার্থক্য কোথায়?</h2>
      <p>
        অনলাইনে <em>"বিনিয়োগ বৃদ্ধি"</em> লিখে সার্চ করলে অনেকে <strong>sie-b.org (B-Briddhi)</strong> দেখতে পান, যা মূলত সুইসকন্টাক্ট (Swisscontact) ও রুটস অব ইমপ্যাক্ট-এর একটি সোশ্যাল এন্টারপ্রাইজ অনুদান ও টেকনিক্যাল অ্যাসিসট্যান্স প্রোগ্রাম। 
        সেটি কোনো সাধারণ মানুষের রিটেইল বিনিয়োগের প্ল্যাটফর্ম নয়।
      </p>
      <p>
        অন্যদিকে, <strong>biniyogbriddhi.com</strong> হলো বাংলাদেশের সাধারণ নাগরিক ও প্রবাসী ভাই-বোনদের জন্য একমাত্র উন্মুক্ত ও সরাসরি ব্যবসায় বিনিয়োগের পোর্টাল, যেখানে আপনি ৫,০০০ টাকা থেকে শুরু করে যেকোনো অঙ্কের মূলধন সরাসরি লাভজনক ব্যবসায় বিনিয়োগ করে নিয়মিত মুনাফা অর্জন করতে পারেন।
      </p>

      <h2 class="text-2xl font-bold text-foreground mt-8 mb-4">৩. বিনিয়োগ বৃদ্ধি প্ল্যাটফর্ম কীভাবে কাজ করে?</h2>
      <ol class="list-decimal list-inside space-y-3 pl-2">
        <li><strong>সুযোগ বাছাই:</strong> ওয়েবসাইটের <em>সুযোগসমূহ (Opportunities)</em> পাতা থেকে আপনার পছন্দের খাত (যেমন: খাদ্যপণ্য, কৃষি, রিটেইল, প্রযুক্তি ইত্যাদি) নির্বাচন করুন।</li>
        <li><strong>ডিটেইল ও ঝুঁকি পর্যালোচনা:</strong> ব্যবসার বিগত পারফরম্যান্স, আর্থিক মডেল, ব্রেক-ইভেন এবং CFA মন্তব্য ভালোভাবে পড়ুন।</li>
        <li><strong>বিনিয়োগ সম্পাদন:</strong> স্বচ্ছ শর্তাবলীতে বিনিয়োগ ফর্ম পূরণ করুন এবং সরাসরি ব্যবসায়ীর একাউন্টে বা অনুমোদিত মাধ্যমে ফান্ড প্রদান করুন।</li>
        <li><strong>চুক্তিপত্র গ্রহণ:</strong> আপনার বিনিয়োগের অনুকূলে স্ট্যাম্প চুক্তিপত্র এবং আইনি সিকিউরিটি বুঝে নিন।</li>
        <li><strong>নিয়মিত মুনাফা ও আপডেট:</strong> প্রতি মাসে ব্যবসার বিক্রির হিসাব ও অর্জিত মুনাফা সরাসরি আপনার ব্যাংক বা মোবাইল একাউন্টে গ্রহণ করুন।</li>
      </ol>

      <h2 class="text-2xl font-bold text-foreground mt-8 mb-4">৪. সাধারণ প্রশ্নোত্তর (FAQ)</h2>
      <div class="space-y-4">
        <div>
          <h4 class="font-bold text-foreground">প্রশ্ন: বিনিয়োগের মূল টাকা কি ফেরত পাওয়া যায়?</h4>
          <p class="text-sm text-muted-foreground mt-1">উত্তর: হ্যাঁ, চুক্তির মেয়াদ শেষে আপনার মূলধন সম্পূর্ণ ফেরত দেওয়া হয় অথবা চুক্তি নবায়নের সুযোগ থাকে।</p>
        </div>
        <div>
          <h4 class="font-bold text-foreground">প্রশ্ন: এটি কি শরীয়াহ সম্মত?</h4>
          <p class="text-sm text-muted-foreground mt-1">উত্তর: সম্পূর্ণভাবে। এখানে কোনো পূর্বনির্ধারিত ফিক্সড ইন্টারেস্ট দেওয়া হয় না। ব্যবসার প্রকৃত লাভ থেকে আনুপাতিক হারে মুনাফা প্রদান করা হয়।</p>
        </div>
      </div>

      <div class="mt-8 pt-6 border-t border-border flex items-center justify-between">
        <p class="text-sm font-semibold text-primary">আজই যুক্ত হোন স্বচ্ছ বিনিয়োগের নতুন ধারায় — BiniyogBriddhi.com</p>
      </div>
    </div>',
    v_cat_guidance,
    'published',
    'মোহাইমিন পাটোয়ারী, CFA',
    'বিনিয়োগ বৃদ্ধি কি? বাংলাদেশে ব্যবসায় বিনিয়োগের সম্পূর্ণ গাইড | Biniyog Briddhi',
    'বিনিয়োগ বৃদ্ধি কি এবং কেন এটি বাংলাদেশে সাধারণ মানুষের জন্য সবচেয়ে নির্ভরযোগ্য সুদমুক্ত ব্যবসায়িক প্ল্যাটফর্ম? sie-b এর সাথে পার্থক্য এবং ব্যবসায় বিনিয়োগের পূর্ণাঙ্গ গাইড।',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day',
    NOW()
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    content_html = EXCLUDED.content_html,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    status = 'published',
    updated_at = NOW();


  -- 3. Post 2: বাংলাদেশে SME বিনিয়োগ করার ৫টি উপায় ২০২৬
  INSERT INTO public.blog_posts (
    title,
    slug,
    excerpt,
    content_html,
    category_id,
    status,
    author_name,
    meta_title,
    meta_description,
    published_at,
    created_at,
    updated_at
  ) VALUES (
    'বাংলাদেশে SME বিনিয়োগ করার ৫টি উপায় ২০২৬',
    'bangladesh-sme-investment-5-ways-2026',
    '২০২৬ সালে বাংলাদেশের অর্থনৈতিক পরিস্থিতিতে ক্ষুদ্র ও মাঝারি শিল্পে (SME) সফলভাবে বিনিয়োগ করার ৫টি আধুনিক ও লাভজনক উপায় জেনে নিন।',
    '<div class="blog-content space-y-6">
      <p class="lead text-lg text-foreground/90 font-medium">
        বাংলাদেশের অর্থনীতির মেরুদণ্ড হলো ক্ষুদ্র ও মাঝারি শিল্প (SME Sector)। জিডিপির সিংহভাগ আসে এই খাত থেকে। 
        ২০২৬ সালের বর্তমান অর্থনৈতিক পরিস্থিতিতে এসএমই খাতে বিনিয়োগ সাধারণ মানুষের জন্য সবচেয়ে বাস্তবসম্মত রিটার্নের সুযোগ তৈরি করছে।
      </p>

      <h2 class="text-2xl font-bold text-foreground mt-8 mb-4">কেন ২০২৬ সালে SME বিনিয়োগ সবচেয়ে লাভজনক?</h2>
      <p>
        মুদ্রাস্ফীতি ও ব্যাংকের আনুষ্ঠানিক ঋণের উচ্চ সুদের কারণে এসএমই উদ্যোক্তারা সরাসরি রিটেইল বিনিয়োগকারীদের সাথে অংশীদারিত্ব করতে বেশি আগ্রহী। 
        এর ফলে বিনিয়োগকারীরা ২০% থেকে ৩০% পর্যন্ত বার্ষিক প্রফিট শেয়ারিংয়ের সম্ভাবনা পাচ্ছেন।
      </p>

      <h2 class="text-2xl font-bold text-foreground mt-8 mb-4">এসএমই খাতে বিনিয়োগের সেরা ৫টি উপায়:</h2>

      <div class="space-y-6 mt-4">
        <div class="rounded-xl border border-border bg-card p-5">
          <h3 class="text-lg font-bold text-primary mb-2">১. কো-ইনভেস্টমেন্ট (Co-Investment) মডেল</h3>
          <p class="text-sm text-foreground/85 leading-relaxed">
            একটি মাঝারি ব্যবসায় একা ৫০ লাখ বা ১ কোটি টাকা দেওয়া অনেকের পক্ষে অসম্ভব। কো-ইনভেস্টমেন্টের মাধ্যমে ২০-৩০ জন ক্ষুদ্র বিনিয়োগকারী মিলে 
            ৫০ হাজার বা ১ লাখ টাকা করে বিনিয়োগ করেন। এর ফলে ঝুঁকি সর্বনিম্ন থাকে এবং বড় ব্যবসার লাভের অংশীদার হওয়া যায়।
          </p>
        </div>

        <div class="rounded-xl border border-border bg-card p-5">
          <h3 class="text-lg font-bold text-primary mb-2">২. কার্যকরী মূলধন ও ইনভেন্টরি ফাইন্যান্সিং (Working Capital)</h3>
          <p class="text-sm text-foreground/85 leading-relaxed">
            উৎপাদনশীল ব্যবসার পণ্য তৈরির জন্য কাঁচামাল কেনার ফান্ড দরকার হয়। এই ধরণের বিনিয়োগে পণ্য বিক্রি হওয়ার সাথে সাথেই ৩ থেকে ৬ মাসের মধ্যে লাভসহ মূলধন ফেরত পাওয়া যায়। 
            এটি স্বল্পমেয়াদী ও উচ্চ তারল্যযুক্ত বিনিয়োগের উৎকৃষ্ট মাধ্যম।
          </p>
        </div>

        <div class="rounded-xl border border-border bg-card p-5">
          <h3 class="text-lg font-bold text-primary mb-2">৩. ডেইরি, কৃষি ও বাণিজ্যিক খাদ্য প্রক্রিয়াজাতকরণ</h3>
          <p class="text-sm text-foreground/85 leading-relaxed">
            বাংলাদেশে নিত্যপ্রয়োজনীয় খাদ্য ও কৃষি খাতের চাহিদা কখনো কমে না। অভিজ্ঞ ফার্ম ও প্রসেসিং ইউনিটে বিনিয়োগ করলে পণ্যের ন্যায্য মূল্যের সুবিধা পাওয়া যায় 
            এবং ঝুঁকি থাকে অত্যন্ত সীমিত।
          </p>
        </div>

        <div class="rounded-xl border border-border bg-card p-5">
          <h3 class="text-lg font-bold text-primary mb-2">৪. রিটেইল ও চেইন স্টোর সম্প্রসারণ</h3>
          <p class="text-sm text-foreground/85 leading-relaxed">
            যেসব ব্র্যান্ড ইতিমধ্যে ২-৩টি আউটলেটে সফল হয়েছে, তাদের নতুন আউটলেট চালুর জন্য ফ্র্যাঞ্চাইজ বা ক্যাপিটাল পার্টনারশিপ মডেলে বিনিয়োগ করা। 
            দৈনন্দিন ক্যাশ-ফ্লো পর্যবেক্ষণ করা এতে খুব সহজ হয়।
          </p>
        </div>

        <div class="rounded-xl border border-border bg-card p-5">
          <h3 class="text-lg font-bold text-primary mb-2">৫. বিনিয়োগ বৃদ্ধি (Biniyog Briddhi) এর মতো যাচাইকৃত প্ল্যাটফর্ম</h3>
          <p class="text-sm text-foreground/85 leading-relaxed">
            নিজে একা ব্যবসায়ীর পেছনে না ঘুরে অভিজ্ঞ চার্টার্ড ফাইন্যান্সিয়াল অ্যানালিস্ট (CFA) দ্বারা নিরীক্ষিত প্ল্যাটফর্মের মাধ্যমে যুক্ত হওয়া। 
            এতে ব্যবসায়ীর অডিট, লিগ্যাল কন্ট্রাক্ট এবং সিকিউরিটি ডকুমেন্টস আগেই নিশ্চিত করা থাকে।
          </p>
        </div>
      </div>

      <h2 class="text-2xl font-bold text-foreground mt-8 mb-4">সারসংক্ষেপ</h2>
      <p>
        ২০২৬ সালে অলস টাকা ব্যাংকে ফেলে রাখা মানেই মূল্যস্ফীতির কারণে টাকার মান হারানো। সঠিক তথ্যের ভিত্তিতে সম্ভাবনাময় এসএমই খাতে বিনিয়োগ করুন এবং দেশের অর্থনীতিতে ভূমিকা রাখুন।
      </p>
    </div>',
    v_cat_guidance,
    'published',
    'মোহাইমিন পাটোয়ারী, CFA',
    'বাংলাদেশে SME বিনিয়োগ করার ৫টি উপায় ২০২৬ | বিনিয়োগ বৃদ্ধি',
    '২০২৬ সালে বাংলাদেশে ক্ষুদ্র ও মাঝারি শিল্পে (SME) সফলভাবে বিনিয়োগ করার ৫টি আধুনিক ও লাভজনক উপায়। জানুন কো-ইনভেস্টমেন্ট ও নিরাপদ বিনিয়োগের উপায়।',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days',
    NOW()
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    content_html = EXCLUDED.content_html,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    status = 'published',
    updated_at = NOW();


  -- 4. Post 3: ব্যবসায় বিনিয়োগ vs ব্যাংক সেভিংস — কোনটা ভালো?
  INSERT INTO public.blog_posts (
    title,
    slug,
    excerpt,
    content_html,
    category_id,
    status,
    author_name,
    meta_title,
    meta_description,
    published_at,
    created_at,
    updated_at
  ) VALUES (
    'ব্যবসায় বিনিয়োগ vs ব্যাংক সেভিংস — কোনটা ভালো?',
    'business-investment-vs-bank-savings-bangladesh',
    'আপনার জমানো টাকা কি ব্যাংকে অলস পড়ে আছে? মূল্যস্ফীতি ও সুদের বিপরীতে সরাসরি লাভজনক ব্যবসায় বিনিয়োগ বনাম ব্যাংক ডিপোজিটের বিস্তারিত তুলনামূলক বিশ্লেষণ।',
    '<div class="blog-content space-y-6">
      <p class="lead text-lg text-foreground/90 font-medium">
        আমরা ছোটবেলা থেকে শুনে এসেছি—টাকা ব্যাংকে রেখে দাও, নিরাপদ থাকবে। কিন্তু বর্তমান বাস্তবতায় ব্যাংকে টাকা রাখা কি সত্যিই আপনার সম্পদ বাড়াচ্ছে, নাকি প্রতিনিয়ত টাকার ক্রয়ক্ষমতা কমিয়ে দিচ্ছে?
      </p>

      <h2 class="text-2xl font-bold text-foreground mt-8 mb-4">১. মূল্যস্ফীতি (Inflation): অলস টাকার নীরব ঘাতক</h2>
      <p>
        বর্তমানে দেশে মূল্যস্ফীতির হার প্রায় ৯% থেকে ১১%। আপনি যদি ব্যাংকে ৮% সুদে ফিক্সড ডিপোজিট (FDR) রাখেন, তবে কর ও আবগারি শুল্ক কাটার পর আপনার কার্যকর রিটার্ন দাঁড়ায় ৬.৫% থেকে ৭%। 
        অর্থাৎ, ১ বছর পর আপনার টাকার ক্রয়ক্ষমতা বাড়ার বদলে আরও কমে যাচ্ছে!
      </p>

      <h2 class="text-2xl font-bold text-foreground mt-8 mb-4">২. সরাসরি ব্যবসায় বিনিয়োগের শক্তিশালী দিকগুলো</h2>
      <ul class="list-disc list-inside space-y-2 text-foreground/85">
        <li><strong>প্রকৃত সম্পদভিত্তিক লাভ (Asset-Backed):</strong> ব্যবসায় বিনিয়োগ মানে কাঁচামাল, যন্ত্রপাতি বা বিক্রয়যোগ্য পণ্যে মূলধন খাটানো। পণ্যের দাম বাড়লে ব্যবসার লাভও বৃদ্ধি পায়।</li>
        <li><strong>উচ্চ রিটার্ন সম্ভাবনা:</strong> একটি সফল এসএমই ব্যবসা সাধারণত ১৫% থেকে ২৫% পর্যন্ত বার্ষিক প্রফিট মার্জিন দিতে সক্ষম।</li>
        <li><strong>১০০% হালাল ও নৈতিক:</strong> কোনো কৃত্রিম সুদ নেই; ব্যবসায়ে লাভ হলে আপনি লাভের ভাগ পাবেন, যা ধর্মীয় ও সামাজিকভাবে সম্পূর্ণ বরকতপূর্ণ।</li>
      </ul>

      <h2 class="text-2xl font-bold text-foreground mt-8 mb-4">৩. তুলনামূলক বিশ্লেষণ চার্ট</h2>
      <div class="overflow-x-auto my-6">
        <table class="w-full text-left text-sm border border-border rounded-xl">
          <thead class="bg-muted text-foreground">
            <tr>
              <th class="p-3.5 border-b border-border">মানদণ্ড</th>
              <th class="p-3.5 border-b border-border">ব্যাংক ডিপোজিট (FDR/DPS)</th>
              <th class="p-3.5 border-b border-border">যাচাইকৃত ব্যবসায় বিনিয়োগ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr>
              <td class="p-3.5 font-semibold">কার্যকর রিটার্ন</td>
              <td class="p-3.5 text-red-600 dark:text-red-400">নেতিবাচক (ইনফ্লেশন কাটার পর)</td>
              <td class="p-3.5 text-emerald-600 dark:text-emerald-400 font-bold">১৫% - ২৫%+ (প্রকৃত লাভ)</td>
            </tr>
            <tr>
              <td class="p-3.5 font-semibold">শরীয়াহ দৃষ্টিভঙ্গি</td>
              <td class="p-3.5 text-red-600 dark:text-red-400">সুদের নিশ্চিত উপস্থিতি</td>
              <td class="p-3.5 text-emerald-600 dark:text-emerald-400">সম্পূর্ণ সুদমুক্ত অংশীদারিত্ব</td>
            </tr>
            <tr>
              <td class="p-3.5 font-semibold">ঝুঁকির ধরন</td>
              <td class="p-3.5">মুদ্রার মানহানি ও ব্যাংকিং ক্রাইসিস</td>
              <td class="p-3.5">বাণিজ্যিক ঝুঁকি (যা অডিটে নিয়ন্ত্রিত)</td>
            </tr>
            <tr>
              <td class="p-3.5 font-semibold">দেশের অর্থনীতিতে ভূমিকা</td>
              <td class="p-3.5">সীমিত</td>
              <td class="p-3.5 text-emerald-600 dark:text-emerald-400">সরাসরি কর্মসংস্থান সৃষ্টি ও দেশীয় উৎপাদন বৃদ্ধি</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 class="text-2xl font-bold text-foreground mt-8 mb-4">তাহলে কোনটি বেছে নেবেন?</h2>
      <p>
        জরুরি প্রয়োজনের জন্য ২-৩ মাসের খরচ সেভিংস একাউন্টে রাখা যেতে পারে। কিন্তু দীর্ঘমেয়াদে সম্পদ বৃদ্ধির জন্য যাচাইকৃত ও নির্ভরযোগ্য ব্যবসায় অংশীদারিত্বমূলক বিনিয়োগ করাই হলো আর্থিক স্বাধীনতার একমাত্র কার্যকর পথ।
      </p>
    </div>',
    v_cat_guidance,
    'published',
    'মোহাইমিন পাটোয়ারী, CFA',
    'ব্যবসায় বিনিয়োগ vs ব্যাংক সেভিংস — কোনটা ভালো? | বিনিয়োগ বৃদ্ধি',
    'আপনার জমানো টাকা কি ব্যাংকে অলস পড়ে আছে? মূল্যস্ফীতি ও সুদের বিপরীতে সরাসরি লাভজনক ব্যবসায় বিনিয়োগ বনাম ব্যাংক ডিপোজিটের তুলনামূলক বিশ্লেষণ।',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days',
    NOW()
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    content_html = EXCLUDED.content_html,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    status = 'published',
    updated_at = NOW();


  -- 5. Post 4: বাংলাদেশে co-investment কিভাবে কাজ করে
  INSERT INTO public.blog_posts (
    title,
    slug,
    excerpt,
    content_html,
    category_id,
    status,
    author_name,
    meta_title,
    meta_description,
    published_at,
    created_at,
    updated_at
  ) VALUES (
    'বাংলাদেশে co-investment কিভাবে কাজ করে',
    'how-co-investment-works-in-bangladesh',
    'কো-ইনভেস্টমেন্ট বা যৌথ বিনিয়োগ কী? একক বিনিয়োগের সীমাবদ্ধতা দূর করে কীভাবে একাধিক বিনিয়োগকারী মিলে একটি লাভজনক ব্যবসায় অংশীদার হন — জেনে নিন বিস্তারিত।',
    '<div class="blog-content space-y-6">
      <p class="lead text-lg text-foreground/90 font-medium">
        বিশ্বজুড়ে অ্যাঞ্জেল ইনভেস্টিং ও ভেঞ্চার ক্যাপিটালে সবচেয়ে জনপ্রিয় মডেল হলো <strong>কো-ইনভেস্টমেন্ট (Co-Investment)</strong>। 
        বাংলাদেশে সাধারণ বিনিয়োগকারীদের জন্য এই মডেলটি এখন এক নতুন সম্ভাবনার দ্বার উন্মোচন করেছে।
      </p>

      <h2 class="text-2xl font-bold text-foreground mt-8 mb-4">১. কো-ইনভেস্টমেন্ট আসলে কী?</h2>
      <p>
        ধরা যাক, একটি লাভজনক এগ্রো ফার্ম বা রেস্টুরেন্ট চেইনের নতুন শাখা চালুর জন্য ৩০ লাখ টাকা প্রয়োজন। একজন ব্যক্তির পক্ষে একা ৩০ লাখ টাকা দেওয়া কঠিন বা অতিরিক্ত ঝুঁকিপূর্ণ। 
        কিন্তু যদি ৩০ জন বিনিয়োগকারী মিলে প্রত্যেকে ১ লাখ টাকা করে প্রদান করেন, তবে পুরো মূলধনটি মুহূর্তেই সংগৃহীত হয়। এই প্রক্রিয়াই হলো <strong>কো-ইনভেস্টমেন্ট বা সিন্ডিকেট পার্টনারশিপ</strong>।
      </p>

      <h2 class="text-2xl font-bold text-foreground mt-8 mb-4">২. কো-ইনভেস্টমেন্টের ৩টি সেরা সুবিধা</h2>
      <div class="grid sm:grid-cols-3 gap-4 my-6">
        <div class="rounded-xl border border-border bg-card p-4">
          <div class="font-bold text-primary mb-1">ঝুঁকি বণ্টন (Risk Diversification)</div>
          <p class="text-xs text-muted-foreground">সব মূলধন এক ঝুড়িতে না রেখে অল্প অল্প করে একাধিক ব্যবসায় ভাগ করে বিনিয়োগ করা যায়।</p>
        </div>
        <div class="rounded-xl border border-border bg-card p-4">
          <div class="font-bold text-primary mb-1">ছোট পুঁজিতে বড় ব্যবসা</div>
          <p class="text-xs text-muted-foreground">মাত্র ১০ হাজার বা ২০ হাজার টাকা দিয়েও কোটি টাকার প্রতিষ্ঠিত ব্যবসায় পার্টনার হওয়া সম্ভব।</p>
        </div>
        <div class="rounded-xl border border-border bg-card p-4">
          <div class="font-bold text-primary mb-1">যৌথ পর্যবেক্ষণ শক্তি</div>
          <p class="text-xs text-muted-foreground">বহু বিনিয়োগকারী একত্রিত থাকায় ব্যবসায়ীর ওপর জবাবদিহিতা ও স্বচ্ছতা বহুগুণে বৃদ্ধি পায়।</p>
        </div>
      </div>

      <h2 class="text-2xl font-bold text-foreground mt-8 mb-4">৩. বাংলাদেশে এর আইনি বৈধতা ও চুক্তি</h2>
      <p>
        বাংলাদেশে কো-ইনভেস্টমেন্ট সম্পূর্ণ বৈধ। অংশীদারিত্ব চুক্তিপত্র ১৮৭২ সালের চুক্তি আইন (Contract Act 1872) এবং অংশীদারি আইন ১৯৩২ অনুযায়ী কার্যকর হয়। 
        প্রতিটি বিনিয়োগকারী স্ট্যাম্প পেপারে তার প্রদত্ত অংশের সুনির্দিষ্ট অধিকার, প্রফিট শেয়ারিং পার্সেন্টেজ এবং সিকিউরিটি চেকের নিশ্চয়তা পান।
      </p>

      <h2 class="text-2xl font-bold text-foreground mt-8 mb-4">৪. বিনিয়োগ বৃদ্ধি প্ল্যাটফর্মে কীভাবে কো-ইনভেস্ট করবেন?</h2>
      <p>
        <strong>বিনিয়োগ বৃদ্ধি (Biniyog Briddhi)</strong> প্ল্যাটফর্ম পুরো প্রক্রিয়াটিকে ডিজিটাল ও স্বচ্ছ করে তুলেছে। 
        ওয়েবসাইটে প্রতিটি প্রকল্পের জন্য প্রয়োজনীয় মোট মূলধন, প্রতি ইউনিটের মূল্য (যেমন: প্রতি শেয়ার বা টিকিট মূল্য) এবং প্রত্যাশিত লাভের রেঞ্জ উল্লেখ থাকে। 
        বিনিয়োগকারী তার পছন্দের টিকিট সংখ্যা সিলেক্ট করে যুক্ত হতে পারেন।
      </p>
    </div>',
    v_cat_halal,
    'published',
    'বিনিয়োগ বৃদ্ধি অ্যানালাইসিস টিম',
    'বাংলাদেশে co-investment কিভাবে কাজ করে | বিনিয়োগ বৃদ্ধি',
    'কো-ইনভেস্টমেন্ট বা যৌথ বিনিয়োগ কী? একক বিনিয়োগের সীমাবদ্ধতা দূর করে কীভাবে একাধিক বিনিয়োগকারী মিলে একটি লাভজনক ব্যবসায় অংশীদার হন — জেনে নিন বিস্তারিত।',
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '4 days',
    NOW()
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    content_html = EXCLUDED.content_html,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    status = 'published',
    updated_at = NOW();


  -- 6. Post 5: যাচাইকৃত ব্যবসায় বিনিয়োগ কিভাবে করবেন — ধাপে ধাপে
  INSERT INTO public.blog_posts (
    title,
    slug,
    excerpt,
    content_html,
    category_id,
    status,
    author_name,
    meta_title,
    meta_description,
    published_at,
    created_at,
    updated_at
  ) VALUES (
    'যাচাইকৃত ব্যবসায় বিনিয়োগ কিভাবে করবেন — ধাপে ধাপে',
    'step-by-step-guide-to-verified-business-investment',
    'বিনিয়োগ করার আগে ব্যবসা কীভাবে যাচাই করবেন? প্রতারণা এড়িয়ে সঠিক ব্যবসায় বিনিয়োগ করার বাস্তবসম্মত ৫টি ধাপ জানুন।',
    '<div class="blog-content space-y-6">
      <p class="lead text-lg text-foreground/90 font-medium">
        উদ্যোক্তার মুখরোচক কথায় বা সোশ্যাল মিডিয়ার চটকদার বিজ্ঞাপনে মুগ্ধ হয়ে অন্ধভাবে বিনিয়োগ করাই সাধারণ বিনিয়োগকারীদের ক্ষতির প্রধান কারণ। 
        সফল বিনিয়োগকারী হতে হলে আবেগে নয়, বরং বাস্তব তথ্যের ওপর ভিত্তি করে সিদ্ধান্ত নিতে হবে।
      </p>

      <h2 class="text-2xl font-bold text-foreground mt-8 mb-4">যাচাইকৃত ব্যবসায় বিনিয়োগের ৫টি বাস্তবসম্মত ধাপ:</h2>

      <div class="space-y-6">
        <div class="rounded-2xl border border-border bg-card p-6">
          <div class="flex items-center gap-3 mb-3">
            <span class="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">১</span>
            <h3 class="text-lg font-bold text-foreground">উদ্যোক্তার ব্যাকগ্রাউন্ড ও সততা যাচাই</h3>
          </div>
          <p class="text-sm text-foreground/85 leading-relaxed">
            ব্যবসা পরিচালনা করে মানুষ। উদ্যোক্তার পারিবারিক পরিচিতি, অতীত ট্র্যাক রেকর্ড, পূর্ববর্তী ঋণের ইতিহাস (CIB রিপোর্ট) এবং সামাজিক মর্যাদা যাচাই করুন। 
            যিনি আগে কখনো ব্যবসা করেননি, কেবল ধারণা (Idea) দিয়ে তার হাতে মূলধন তুলে দেওয়া মারাত্মক ঝুঁকিপূর্ণ।
          </p>
        </div>

        <div class="rounded-2xl border border-border bg-card p-6">
          <div class="flex items-center gap-3 mb-3">
            <span class="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">২</span>
            <h3 class="text-lg font-bold text-foreground">সরেজমিনে সাইট ভিজিট (Ground Verification)</h3>
          </div>
          <p class="text-sm text-foreground/85 leading-relaxed">
            কাগজে-কলমে ব্যবসা অনেক বড় দেখানো সম্ভব। কিন্তু সরেজমিনে কারখানা, গোডাউন বা শোরুম পরিদর্শনে গেলে প্রকৃত পরিস্থিতি বোঝা যায়। 
            পণ্য উৎপাদন হচ্ছে কি না, ক্রেতাদের ভিড় কেমন এবং স্টক রেজিস্টার ঠিক আছে কি না তা নিজ চোখে দেখুন।
          </p>
        </div>

        <div class="rounded-2xl border border-border bg-card p-6">
          <div class="flex items-center gap-3 mb-3">
            <span class="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">৩</span>
            <h3 class="text-lg font-bold text-foreground">ক্যাশ-ফ্লো ও ব্যাংক স্টেটমেন্ট অডিট</h3>
          </div>
          <p class="text-sm text-foreground/85 leading-relaxed">
            বিগত ১-২ বছরের ব্যাংক স্টেটমেন্ট এবং অডিট রিপোর্ট পরীক্ষা করুন। ব্যবসার অ্যাকাউন্টে নিয়মিত বিক্রির টাকা ঢুকছে কি না এবং 
            অপ্রয়োজনীয় দেনা আছে কি না তা একজন অভিজ্ঞ ফাইন্যান্স এক্সপার্ট দিয়ে মূল্যায়ন করান।
          </p>
        </div>

        <div class="rounded-2xl border border-border bg-card p-6">
          <div class="flex items-center gap-3 mb-3">
            <span class="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">৪</span>
            <h3 class="text-lg font-bold text-foreground">আইনি চুক্তি ও সিকিউরিটি চেক নিশ্চিতকরণ</h3>
          </div>
          <p class="text-sm text-foreground/85 leading-relaxed">
            কোনো ধরনের মৌখিক প্রতিশ্রুতি বা অনিবন্ধিত নোটে টাকা দেওয়া যাবে না। ন্যূনতম ৩০০ বা ১০০০ টাকার নন-জুডিশিয়াল স্ট্যাম্পে আইনগত চুক্তিপত্র, 
            প্রতিষ্ঠানের নামে সিকিউরিটি চেক এবং প্রযোজ্য ক্ষেত্রে পরিচালকদের ব্যক্তিগত গ্যারান্টিপত্র গ্রহণ করুন।
          </p>
        </div>

        <div class="rounded-2xl border border-border bg-card p-6">
          <div class="flex items-center gap-3 mb-3">
            <span class="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">৫</span>
            <h3 class="text-lg font-bold text-foreground">বিনিয়োগ বৃদ্ধি (Biniyog Briddhi) এর মাধ্যমে বিনিয়োগ</h3>
          </div>
          <p class="text-sm text-foreground/85 leading-relaxed">
            ব্যক্তিগতভাবে এতগুলো ধাপ সম্পন্ন করা সাধারণ পেশাজীবী বা প্রবাসীদের জন্য প্রায় অসম্ভব। 
            <strong>বিনিয়োগ বৃদ্ধি</strong> প্ল্যাটফর্ম আপনার হয়ে অভিজ্ঞ চার্টার্ড ফাইন্যান্সিয়াল অ্যানালিস্ট (CFA) ও লিগ্যাল টিম দ্বারা 
            এই প্রতিটি ধাপ যাচাই করে শতভাগ নিরাপদ ও স্বচ্ছ বিনিয়োগ নিশ্চিত করে।
          </p>
        </div>
      </div>

      <div class="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/20 text-center">
        <h3 class="font-bold text-lg text-primary mb-2">নিরাপদ বিনিয়োগ শুরু করতে চান?</h3>
        <p class="text-sm text-muted-foreground mb-4">আমাদের প্ল্যাটফর্মে তালিকাভুক্ত যাচাইকৃত সুযোগগুলো এখনই পর্যবেক্ষণ করুন।</p>
        <a href="/opportunities" class="inline-block rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors">
          চলমান সুযোগসমূহ দেখুন →
        </a>
      </div>
    </div>',
    v_cat_guidance,
    'published',
    'মোহাইমিন পাটোয়ারী, CFA',
    'যাচাইকৃত ব্যবসায় বিনিয়োগ কিভাবে করবেন — ধাপে ধাপে | বিনিয়োগ বৃদ্ধি',
    'বিনিয়োগ করার আগে ব্যবসা কীভাবে যাচাই করবেন? প্রতারণা এড়িয়ে সঠিক ব্যবসায় বিনিয়োগ করার বাস্তবসম্মত ৫টি ধাপ জানুন। CFA গাইডলাইন।',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days',
    NOW()
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    content_html = EXCLUDED.content_html,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    status = 'published',
    updated_at = NOW();

END $$;
