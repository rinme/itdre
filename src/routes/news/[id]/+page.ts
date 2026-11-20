import { error } from "@sveltejs/kit";
import { newsItems } from "$lib/data/news";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
  const article = newsItems.find((item) => item.id === params.id);
  if (!article) {
    error(404, "ไม่พบข่าวสารที่คุณต้องการ");
  }

  const sameCategory = newsItems.filter(
    (item) => item.category === article.category && item.id !== article.id
  );

  let relatedArticles = sameCategory.slice(0, 3);
  if (relatedArticles.length < 3) {
    const additional = newsItems.filter(
      (item) => item.id !== article.id && !relatedArticles.some((r) => r.id === item.id)
    );
    relatedArticles = [...relatedArticles, ...additional].slice(0, 3);
  }

  return {
    article,
    relatedArticles
  };
};
