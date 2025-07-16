
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

const CourseResources = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Resources</CardTitle>
        <CardDescription>Additional materials and downloads</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Course Slides</p>
                <p className="text-sm text-muted-foreground">PDF, 2.5 MB</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Download</Button>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Exercise Solutions</p>
                <p className="text-sm text-muted-foreground">PDF, 1.2 MB</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Download</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseResources;
