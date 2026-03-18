import { request } from './client.js';

export async function getCategories() {
  return request('/courses/categories');
}

export async function getCourses(categoryId = null) {
  const path = categoryId ? `/courses?category_id=${categoryId}` : '/courses';
  return request(path);
}

export async function getCourseBySlug(slug) {
  return request(`/courses/${slug}`);
}
