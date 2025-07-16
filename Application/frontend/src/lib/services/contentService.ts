import api from "@/lib/api.ts";

export const contentService = {
    getSlideHtml: async (courseId: string, slideNumber: number): Promise<string> => {
        try {
            const response = await api.get(`/slides/api/presentations/${courseId}/slide/${slideNumber}`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to load HTML for slide ${slideNumber}`);
        }
    },

    getPresentationData: async (courseId: string): Promise<any> => {
        try {
            const response = await api.get(`/slides/api/presentations/${courseId}/slides`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to load presentation data for course ${courseId}`);
        }
    }

}