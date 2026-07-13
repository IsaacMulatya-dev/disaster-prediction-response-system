import { useEffect, useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, Cell } from 'recharts';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Search } from 'lucide-react';

type TimeRangeKey = '24h' | '7d' | '30d';

interface WeatherData {
  timestamp: number;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
}

interface RiskData {
  type: string;
  emoji: string;
  percentage: number;
  color: string;
}

const KENYA_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita-Taveta',
  'Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo', 'Meru', 'Tharaka-Nithi', 'Embu',
  'Kitui', 'Machakos', 'Makueni', 'Nyandarua', 'Nyeri', 'Kirinyaga', 'Muranga', 'Kiambu',
  'Turkana', 'West Pokot', 'Samburu', 'Trans Nzoia', 'Uasin Gishu', 'Elgeyo-Marakwet', 'Nandi',
  'Baringo', 'Laikipia', 'Nakuru', 'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Kakamega',
  'Vihiga', 'Bungoma', 'Busia', 'Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira'
];

const RISK_TYPES: RiskData[] = [
  { type: 'Flood', emoji: '', percentage: 0, color: '#3b82f6' },
  { type: 'Earthquake', emoji: '', percentage: 0, color: '#f97316' },
  { type: 'Fire', emoji: '', percentage: 0, color: '#ef4444' },
  { type: 'Storm', emoji: '', percentage: 0, color: '#8b5cf6' },
  { type: 'Drought', emoji: '', percentage: 0, color: '#f59e0b' },
  { type: 'Landslide', emoji: '', percentage: 0, color: '#84cc16' }
];

// OpenWeatherMap API configuration
