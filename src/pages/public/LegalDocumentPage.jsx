import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../admin-dashboard/api/axiosClient';

const fetchLegalDocument = async (slug) => {
  const { data } = await axiosClient.get(`/legal/documents/${slug}`, {
    headers: { 'Accept-Language': 'ar' },
  });
  return data;
};

export default function LegalDocumentPage({ documentSlug }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['legalDocument', documentSlug],
    queryFn: () => fetchLegalDocument(documentSlug),
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6 rtl" dir="rtl">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-10"></div>
          <hr className="my-6" />
          <div className="space-y-6">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const document = data;

  if (error || !document) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6 rtl text-center" dir="rtl">
        <p className="text-xl text-red-600 font-semibold mt-10">عذراً، المستند غير متوفر حالياً.</p>
      </div>
    );
  }

  // Sort sections by order if needed, but the prompt says: "sort them by order if they aren't already"
  const sortedSections = [...(document.sections || [])].sort((a, b) => {
    return (a.order || 0) - (b.order || 0);
  });

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 rtl" dir="rtl">
      <h1 className="text-4xl font-bold text-blue-600 mb-2">{document.title}</h1>
      {document.lastUpdated && (
        <p className="text-sm text-gray-500">آخر تحديث: {document.lastUpdated}</p>
      )}
      <hr className="my-6" />

      {sortedSections.map((section, index) => (
        <div key={section.id || index} className="mb-8">
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">{section.title}</h2>
          
          {section.paragraphs?.map((para, idx) => (
            <p key={idx} className="text-gray-600 leading-relaxed mb-4">
              {para}
            </p>
          ))}

          {section.bullets?.length > 0 && (
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
              {section.bullets.map((bullet, idx) => (
                <li key={idx}>{bullet}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
