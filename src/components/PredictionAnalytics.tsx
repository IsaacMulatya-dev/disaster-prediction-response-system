import { Brain, BarChart3, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useRealtimePredictions } from "@/hooks/useRealtimeData";

const riskColors = {
  low: 'text-success',
  medium: 'text-warning',
  high: 'text-danger',
};

export function PredictionAnalytics() {
  const { predictions, loading } = useRealtimePredictions();
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Predictions & Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-muted-foreground">Loading predictions...</div>
          ) : predictions.length === 0 ? (
            <div className="text-center text-muted-foreground">No predictions available</div>
          ) : (
            predictions.map((prediction, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{prediction.type}</span>
                  <span className={`text-sm ${riskColors[prediction.risk_level]}`}>
                    {prediction.confidence}% confidence
                  </span>
                </div>
                <Progress value={prediction.confidence} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{prediction.timeframe}</span>
                  <span>{prediction.location}</span>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="border-t border-border pt-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Model Performance</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Accuracy Rate</div>
              <div className="font-bold text-success">94.2%</div>
            </div>
            <div>
              <div className="text-muted-foreground">False Positives</div>
              <div className="font-bold text-warning">5.8%</div>
            </div>
            <div>
              <div className="text-muted-foreground">Response Time</div>
              <div className="font-bold text-info">2.3 min</div>
            </div>
            <div>
              <div className="text-muted-foreground">Coverage</div>
              <div className="font-bold text-primary">1.2M people</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}