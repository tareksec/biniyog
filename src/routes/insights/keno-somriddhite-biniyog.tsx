import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { usePrefersReducedMotion, revealVariants, staggerContainer } from "@/lib/animations";
import { motion } from "framer-motion";

export const Route = createFileRoute("/insights/keno-somriddhite-biniyog")({
  head: () => ({
    meta: [
      { title: "কেন 'বিনিয়োগ বৃদ্ধি'-তে বিনিয়োগ করবেন — সম্পূর্ণ গাইড · বিনিয়োগ বৃদ্ধি" },
      {
        name: "description",
        content:
          "ব্যবসায়ীর সাথে সরাসরি সংযোগ, সুদমুক্ত আয়, আইনি সুরক্ষা, স্বচ্ছ চুক্তি — জেনে নিন কেন বিনিয়োগ বৃদ্ধি বাংলাদেশের সবচেয়ে বিশ্বস্ত হালাল বিনিয়োগ প্ল্যাটফর্ম।",
      },
    ],
  }),
  component: WhySamriddhiArticle,
});

const SECTIONS = [
  {
    id: "connect",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "ব্যবসায়ীর সাথে সরাসরি সংযোগ ও স্বাধীন সিদ্ধান্ত",
    paragraphs: [
      "প্রচলিত বিনিয়োগ প্ল্যাটফর্মগুলোতে আপনি সাধারণত একটি মধ্যস্থতাকারীর মাধ্যমে বিনিয়োগ করেন — আপনি জানেন না আপনার টাকা কোথায় যাচ্ছে, কে ব্যবহার করছে, বা সেই ব্যবসাটি আসলেই আছে কিনা। বিনিয়োগ বৃদ্ধি এই ধারণাটিকেই পাল্টে দেয়। এখানে আপনি সরাসরি ব্যবসায়ীর সাথে সংযুক্ত হন, তার সাথে কথা বলতে পারেন, তার ব্যবসার খোঁজখবর নিতে পারেন, এবং নিজেই সিদ্ধান্ত নিতে পারেন যে আপনি এই ব্যবসায় বিশ্বাস করেন কিনা।",
      "আমরা বিশ্বাস করি বিনিয়োগ মানে শুধু টাকা দেওয়া নয় — এটি একটি সম্পর্ক। যখন আপনি জানেন যে আপনার টাকা কোন মানুষের স্বপ্নকে বাস্তবে রূপ দিচ্ছে, তখন সেই বিনিয়োগের মান আলাদা হয়ে যায়। সরাসরি সংযোগের ফলে ব্যবসায়ীও বেশি দায়িত্বশীল হন, কারণ তিনি জানেন যে তার পেছনে আছেন প্রকৃত মানুষ, যারা তাকে বিশ্বাস করেছেন। এই পারস্পরিক সম্পর্কই দীর্ঘমেয়াদী সফল বিনিয়োগের মূল চাবিকাঠি।",
      "সর্বোপরি, সিদ্ধান্তটি সম্পূর্ণ আপনার। আমরা কোনো ব্যবসায় বিনিয়োগের জন্য চাপ প্রয়োগ করি না বা কোনো গোপন কমিশনের ভিত্তিতে সুপারিশ করি না। আপনি নিজে যাচাই-বাছাই করে, ব্যবসায়ীর সাথে কথা বলে, এবং নিজের বুদ্ধি-বিবেচনা খাটিয়ে সম্পূর্ণ স্বাধীনভাবে বিনিয়োগের সিদ্ধান্ত নেন। এটি আপনার অর্থ, আপনার ভবিষ্যৎ — এবং সিদ্ধান্তটিও আপনারই থাকা উচিত।",
    ],
  },
  {
    id: "interest-free",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4M12 3l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7l8-4z" />
      </svg>
    ),
    title: "সুদমুক্ত আয় — শরীয়াহ-সম্মত বিনিয়োগের নিশ্চয়তা",
    paragraphs: [
      "বাংলাদেশের মুসলিম জনগোষ্ঠীর জন্য সুদ একটি বড় উদ্বেগের বিষয়। দুর্ভাগ্যজনকভাবে, আমাদের দেশের অধিকাংশ বিনিয়োগ ও সঞ্চয়পত্র কোনো না কোনোভাবে সুদের সাথে জড়িত — কখনো সরাসরি, কখনো ঘুরিয়ে। বিনিয়োগ বৃদ্ধি সম্পূর্ণ ভিন্ন পথে হাঁটে। আমরা মুদারাবা ও মুশারাকার মতো ইসলামী ফাইন্যান্স নীতির উপর ভিত্তি করে কাজ করি, যেখানে বিনিয়োগকারী ও ব্যবসায়ী লাভ-ক্ষতি উভয়ই ভাগ করে নেন।",
      "মুদারাবা মডেলে আপনি মূলধন সরবরাহ করেন, ব্যবসায়ী তার শ্রম ও দক্ষতা দেন। লাভ পূর্বনির্ধারিত অনুপাতে ভাগ হয়, কিন্তু কোনো অবস্থাতেই মূলধনের উপর নির্দিষ্ট হারে রিটার্ন দেওয়ার প্রতিশ্রুতি দেওয়া হয় না — কারণ এটাই হলো সুদের মূল বৈশিষ্ট্য। ক্ষতি হলে তা মূলধন থেকে সমন্বয় করা হয়, যদি না ব্যবসায়ীর পক্ষ থেকে কোনো অবহেলা বা চুক্তিভঙ্গ প্রমাণিত হয়। এই কাঠামোটি শুধু শরীয়াহ-সম্মতই নয়, বরং বাস্তব অর্থনীতির জন্যও অধিকতর ন্যায়সংগত।",
      "আমরা কোনো প্রকার 'ঘুরিয়ে সুদ' খাওয়ার কৌশল প্রয়োগ করি না। আপনি যখন বিনিয়োগ বৃদ্ধির সাথে যুক্ত হন, আপনি নিশ্চিত থাকতে পারেন যে আপনার সম্পূর্ণ উপার্জন প্রক্রিয়াটি ইসলামী শরীয়াহ মোতাবেক হালাল — এবং এই বিষয়ে আমরা কোনো আপস করি না। এটি কেবল একটি বিজ্ঞাপনী দাবি নয়, বরং আমাদের পুরো ব্যবসায়িক মডেলের ভিত্তি।",
    ],
  },
  {
    id: "legal",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />
      </svg>
    ),
    title: "আইনি সুরক্ষা ও লিখিত চুক্তির গুরুত্ব",
    paragraphs: [
      "বাংলাদেশে ছোট ও মাঝারি উদ্যোক্তাদের সাথে বিনিয়োগের ক্ষেত্রে সবচেয়ে বড় ঝুঁকি হলো চুক্তির অভাব। অনেক সময় মৌখিক প্রতিশ্রুতির উপর ভিত্তি করে লেনদেন হয়ে যায়, যা পরবর্তীতে জটিলতার সৃষ্টি করে। বিনিয়োগ বৃদ্ধি প্রতিটি বিনিয়োগের জন্য একটি পূর্ণাঙ্গ লিখিত চুক্তি নিশ্চিত করে, যেখানে লাভ-ক্ষতি বণ্টনের হার, বিনিয়োগের মেয়াদ, চুক্তিভঙ্গের শর্ত, এবং অন্যান্য প্রয়োজনীয় ধারা স্পষ্টভাবে উল্লেখ থাকে। এই চুক্তি ১৮৭২ সনের চুক্তি আইন এবং প্রয়োজনীয় স্ট্যাম্প আইনের আওতায় আইনত বলবৎযোগ্য।",
      "শুধু চুক্তিই নয়, আমরা প্রতিটি ব্যবসায়ীর বিরুদ্ধে প্রয়োজনীয় ডকুমেন্টেশন ও সিকিউরিটি চেক সম্পন্ন করি। এর মধ্যে রয়েছে জাতীয় পরিচয়পত্র যাচাই, ট্রেড লাইসেন্স পরীক্ষণ, ব্যাংক স্টেটমেন্ট রিভিউ, এবং প্রয়োজনে ব্যক্তিগত গ্যারান্টি বা জামানত গ্রহণ। আমাদের লক্ষ্য একটাই — আপনার বিনিয়োগ যেন কোনো আইনি ফাঁকফোকরে আটকে না যায়।",
      "আইনি সুরক্ষার আরেকটি গুরুত্বপূর্ণ দিক হলো ডিসপিউট রেজোলিউশন বা বিরোধ নিষ্পত্তির প্রক্রিয়া। আমাদের চুক্তিতে সালিশির (arbitration) বিধান থাকে, যা আদালতের বাইরে দ্রুত ও কম খরচে বিরোধ মীমাংসার পথ খুলে দেয়। প্রয়োজনে আমরা উভয় পক্ষকে নিয়ে মধ্যস্থতাও করি। এই স্তরের আইনি কাঠামো ছোট বিনিয়োগের জগতে বিরল, কিন্তু আমরা বিশ্বাস করি আপনার প্রতিটি টাকা নিরাপত্তার প্রাপ্য।",
    ],
  },
  {
    id: "transparent",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
        <path d="M10 9H8" />
      </svg>
    ),
    title: "স্বচ্ছ চুক্তি ও নিয়মিত রিপোর্টিং",
    paragraphs: [
      "অধিকাংশ বিনিয়োগ প্ল্যাটফর্মে অন্ধকারে ঢিল ছোঁড়ার মতো বিনিয়োগ করতে হয় — আপনি টাকা দেন, তারপর অপেক্ষা করেন। মাস শেষে কিছু রিটার্ন পান, কিন্তু জানেন না সেই লাভ কীভাবে হলো, আসল ব্যবসায় কেমন চলছে, বা আপনার টাকা দিয়ে আদৌ কী হচ্ছে। বিনিয়োগ বৃদ্ধি এই অস্বচ্ছতার অবসান ঘটায়। আমাদের মডেলে আপনি প্রতি মাসে একটি বিস্তারিত আর্থিক প্রতিবেদন পান, যেখানে স্পষ্ট থাকে ব্যবসার আয়, ব্যয়, নীট লাভ, এবং আপনার প্রাপ্য অংশ।",
      "এই রিপোর্টিং শুধু সংখ্যার তালিকা নয় — এটি একটি পূর্ণাঙ্গ স্বচ্ছতার সংস্কৃতি। আপনি দেখতে পারবেন কোন মাসে ব্যবসা কেমন করলো, কোন খাতে খরচ বেড়েছে, ভবিষ্যতের জন্য কী পরিকল্পনা রয়েছে। এই তথ্যের ভিত্তিতে আপনি প্রয়োজনে ব্যবসায়ীকে পরামর্শ দিতে পারেন, কিংবা সিদ্ধান্ত নিতে পারেন যে আপনি বিনিয়োগ অব্যাহত রাখবেন কিনা।",
      "আমরা লাভ-ক্ষতি ভাগাভাগির হিসাবও সম্পূর্ণ স্বচ্ছ রাখি। কোনো লুকানো ফি, ম্যানেজমেন্ট চার্জ, বা অপ্রত্যাশিত কাটতি নেই। চুক্তিতে যা লেখা আছে, বাস্তবে তাই করা হয়। এই সরলতা ও সততাই আমাদের বিনিয়োগকারীদের আস্থার মূল ভিত্তি। কারণ আমরা জানি, একটি সম্পর্ক টিকিয়ে রাখতে স্বচ্ছতার কোনো বিকল্প নেই।",
    ],
  },
  {
    id: "verify",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      </svg>
    ),
    title: "বিনিয়োগের আগে ও পরে সরেজমিনে যাচাইয়ের সুযোগ",
    paragraphs: [
      "একটি বিজনেস প্রোফাইল দেখে বা অনলাইন রিভিউ পড়ে বিনিয়োগ করা এক জিনিস, আর নিজে গিয়ে সরেজমিনে দেখা সম্পূর্ণ ভিন্ন জিনিস। বিনিয়োগ বৃদ্ধি বিনিয়োগকারীদের বিনিয়োগের আগে এবং পরেও সরেজমিনে ব্যবসা পরিদর্শনের সুযোগ দেয়। আপনি চাইলে ব্যবসার লোকেশন, ফ্যাক্টরি, অফিস, গুদাম — সবকিছু নিজের চোখে দেখতে পারেন।",
      "বিনিয়োগের আগে পরিদর্শন আপনাকে একটি বাস্তব ধারণা দেয় ব্যবসাটি আদৌ আছে কিনা, অপারেশন কেমন চলছে, কর্মীদের সংখ্যা কত, মেশিনারির অবস্থা কী — এই সবকিছু যা কোনো ওয়েবসাইট বা পিডিএফ থেকে বোঝা সম্ভব নয়। অনেক বিনিয়োগকারী এই সুযোগটি নিয়েছেন এবং তাতেই তাদের আস্থা আরও দৃঢ় হয়েছে। আবার কেউ কেউ পরিদর্শনের পর সিদ্ধান্ত পরিবর্তন করেছেন, যা সম্পূর্ণ বৈধ এবং আমরা তাতে খুশি — কারণ ঠকিয়ে বিনিয়োগ করানো আমাদের উদ্দেশ্য নয়।",
      "বিনিয়োগের পরও আপনি যেকোনো সময় ব্যবসাপ্রতিষ্ঠানে গিয়ে হিসাব ও কার্যক্রম সরাসরি যাচাই করতে পারবেন। এটি শুধু একটি অধিকারই নয়, বরং ব্যবসায়ীর জন্যও একটি সুস্থ চাপ — তিনি জানেন যে তার বিনিয়োগকারী যেকোনো সময় এসে দেখতে পারেন। এই পারস্পরিক জবাবদিহিতাই নিশ্চিত করে যে টাকা খাটছে সঠিক জায়গায়, স্বচ্ছ প্রক্রিয়ায়।",
    ],
  },
  {
    id: "returns",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17l6-6 4 4 8-8M14 7h7v7" />
      </svg>
    ),
    title: "আকর্ষণীয় লাভের বাস্তবতা ও প্রত্যাশা",
    paragraphs: [
      "বাংলাদেশের প্রেক্ষাপটে ব্যাংক ডিপোজিট বা সঞ্চয়পত্র থেকে যে পরিমাণ রিটার্ন পাওয়া যায় (সাধারণত ৬-১২%), তার তুলনায় SME ব্যবসায় সরাসরি বিনিয়োগ করে অনেক বেশি লাভের সম্ভাবনা থাকে — প্রায়শই ১৮-৩০% বা তারও বেশি। এর কারণ সহজ: যখন আপনি সরাসরি একটি ব্যবসার অংশীদার হন, তখন পুরো মুনাফার একটি অংশ আপনার, কোনো ব্যাংক বা আর্থিক মধ্যস্থতাকারী মাঝখানে তাদের কাটতি নিচ্ছে না।",
      "তবে এখানে একটি গুরুত্বপূর্ণ বিষয় পরিষ্কার করে বলা প্রয়োজন: বেশি লাভের অর্থ সবসময় বেশি ঝুঁকিও বটে। বিনিয়োগ বৃদ্ধি কখনোই গ্যারান্টিড রিটার্নের প্রতিশ্রুতি দেয় না। কোনো ব্যবসা ভালো করলে আপনি ব্যাংকের চেয়ে অনেক বেশি পাবেন, আবার খারাপ করলে ক্ষতিও হতে পারে। কিন্তু আমাদের যাচাই প্রক্রিয়া, আইনি কাঠামো, এবং স্বচ্ছ রিপোর্টিং এই ঝুঁকি যতটা সম্ভব কমানোর জন্য নকশা করা হয়েছে। আমরা বিশ্বাস করি, বাস্তবসম্মত প্রত্যাশা নিয়েই একজন বুদ্ধিমান বিনিয়োগকারী দীর্ঘমেয়াদে সফল হন।",
      "আরেকটি বড় সুবিধা হলো মুদ্রাস্ফীতির বিরুদ্ধে সুরক্ষা। বাংলাদেশে গড় মূল্যস্ফীতি প্রায় ৭-৯%। অনেক সঞ্চয়পত্রের রিটার্ন মুদ্রাস্ফীতির সাথে তাল মেলাতে পারে না, অর্থাৎ আপনার টাকার ক্রয়ক্ষমতা আসলে কমছে। কিন্তু একটি বাস্তব ব্যবসায় বিনিয়োগ করলে, ব্যবসার আয় সাধারণত বাজারদরের সাথে সমন্বয় করে, ফলে আপনার রিটার্নও মুদ্রাস্ফীতির সাথে তাল মিলিয়ে চলে।",
    ],
  },
  {
    id: "social",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
      </svg>
    ),
    title: "সমাজের জন্য কল্যাণকর ব্যবসায় বিনিয়োগ",
    paragraphs: [
      "সব ব্যবসা সমাজের জন্য সমানভাবে উপকারী নয়। ক্ষতিকর পণ্য (যেমন তামাক, অ্যালকোহল), ফটকাবাজি, জুয়া, বা অস্বাস্থ্যকর খাদ্যপণ্যের ব্যবসা সমাজ ও ব্যক্তির জন্য ক্ষতির কারণ হয়। বিনিয়োগ বৃদ্ধি এসব ব্যবসাকে কখনোই তার প্ল্যাটফর্মে স্থান দেয় না। আমরা কেবলমাত্র সেই সব ব্যবসা বাছাই করি যেগুলো সমাজের জন্য প্রকৃত মূল্য তৈরি করে — যেমন কৃষি, হালাল খাদ্য প্রক্রিয়াকরণ, পোশাক শিল্প, তথ্যপ্রযুক্তি, নবায়নযোগ্য জ্বালানি, এবং স্বাস্থ্যসেবা।",
      "আমাদের দর্শন সহজ: আপনার বিনিয়োগ শুধু আপনাকেই ধনী করবে না, বরং সমাজকেও সমৃদ্ধ করবে। যখন আপনি একটি কৃষি প্রক্রিয়াকরণ কারখানায় বিনিয়োগ করেন, আপনি শুধু লাভই করেন না — আপনি কৃষকদের ন্যায্যমূল্য পেতে সাহায্য করেন, গ্রামীণ কর্মসংস্থান সৃষ্টি করেন, এবং দেশের খাদ্য নিরাপত্তায় অবদান রাখেন। এই ত্রিমুখী জয়ের ধারণা — আপনার লাভ, ব্যবসায়ীর উন্নতি, এবং সমাজের কল্যাণ — বিনিয়োগ বৃদ্ধির বিনিয়োগ দর্শনের মূলভিত্তি।",
      "আমরা বিশ্বাস করি 'এথিক্যাল ইনভেস্টিং' বা নৈতিক বিনিয়োগ শুধু পশ্চিমা দেশগুলোর বিলাসিতা নয়। বাংলাদেশের মতো উন্নয়নশীল দেশে এর প্রয়োজন আরও বেশি। কারণ এখানে সীমিত সম্পদ যখন সঠিক খাতে বিনিয়োগ হয়, তখন তার গুণগত প্রভাব অনেক বেশি হয়। বিনিয়োগ বৃদ্ধির সাথে বিনিয়োগ করে আপনি শুধু একটি আর্থিক সিদ্ধান্তই নিচ্ছেন না, একটি মূল্যবোধের পক্ষেও দাঁড়াচ্ছেন।",
    ],
  },
];

function WhySamriddhiArticle() {
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    // Handle scrolling to hash on page load, since framer-motion might delay rendering
    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace("#", "");
        setTimeout(() => {
          const element = document.getElementById(id);
          if (element) {
            const headerOffset = 100; // Fixed header height
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth"
            });
          }
        }, 300);
      }
    };
    
    handleHashScroll();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            to="/insights"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            ইনসাইটস
          </Link>
          <span className="text-sm font-bold text-primary">ব্লগ আর্টিকেল</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
        {/* Article Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <span className="pill bg-primary/10 text-primary font-semibold border-none">
              বিনিয়োগ গাইড
            </span>
            <span className="text-xs text-muted-foreground font-medium">৩১ জুলাই ২০২৬</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span className="text-xs text-muted-foreground font-medium">৮ মিনিট পড়া</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-[2.5rem] font-bold leading-tight">
            কেন 'বিনিয়োগ বৃদ্ধি'-তে বিনিয়োগ করবেন: একটি সম্পূর্ণ গাইড
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            বাংলাদেশে হালাল ও স্বচ্ছ উপায়ে SME ব্যবসায় বিনিয়োগের সুযোগ দিন দিন বাড়ছে। কিন্তু সঠিক প্ল্যাটফর্ম বেছে নেওয়া সহজ নয়। বিনিয়োগ বৃদ্ধি কেন আপনার আস্থার পাত্র হতে পারে — চলুন বিস্তারিত জেনে নিই।
          </p>

          {/* Author */}
          <div className="mt-8 flex items-center gap-3 border-t border-border/50 pt-6">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              মপ
            </div>
            <div>
              <p className="text-sm font-semibold">মোহাইমিন পাটোয়ারী</p>
              <p className="text-xs text-muted-foreground">ফাউন্ডার, বিনিয়োগ বৃদ্ধি</p>
            </div>
          </div>
        </div>

        {/* Article Body */}
        <motion.div
          variants={staggerContainer}
          initial={prefersReduced ? "show" : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.05 }}
          className="space-y-16"
        >
          {SECTIONS.map((section) => (
            <motion.section
              key={section.id}
              id={section.id}
              variants={revealVariants}
              className="scroll-mt-24"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  {section.icon}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold leading-snug">
                  {section.title}
                </h2>
              </div>
              <div className="space-y-4">
                {section.paragraphs.map((para, i) => (
                  <p
                    key={i}
                    className="text-[15px] sm:text-base leading-[1.85] text-muted-foreground"
                  >
                    {para}
                  </p>
                ))}
              </div>
            </motion.section>
          ))}
        </motion.div>

        {/* Closing CTA */}
        <div className="mt-20 rounded-2xl border border-border bg-card p-8 sm:p-10 text-center shadow-[var(--shadow-card)]">
          <h3 className="text-xl sm:text-2xl font-bold">
            আপনার বিনিয়োগ যাত্রা শুরু করুন আজই
          </h3>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground max-w-lg mx-auto">
            যাচাইকৃত ব্যবসা প্রতিষ্ঠান দেখুন, সরাসরি ব্যবসায়ীর সাথে কথা বলুন, এবং সম্পূর্ণ স্বচ্ছতার সাথে হালাল বিনিয়োগ শুরু করুন।
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/opportunities"
              className="group inline-flex items-center gap-3 rounded-full px-6 py-3.5 text-[15px] font-semibold text-primary-foreground shadow-[var(--shadow-elevated)] btn-hover"
              style={{ background: "var(--gradient-primary)" }}
            >
              বিনিয়োগের সুযোগ দেখুন
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20 transition-transform group-hover:translate-x-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
            <Link
              to="/insights"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-[15px] font-medium text-foreground btn-hover-sm hover:border-primary/40 hover:text-primary"
            >
              আরও আর্টিকেল পড়ুন
            </Link>
          </div>
        </div>

        {/* Back to top / Footer nav */}
        <div className="mt-12 flex items-center justify-between border-t border-border/50 pt-6">
          <Link
            to="/insights"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            সব আর্টিকেল
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
          >
            হোমে ফিরে যান
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </main>
    </div>
  );
}
