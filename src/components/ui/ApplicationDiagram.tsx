import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Database,
  Server,
  Globe,
  Smartphone,
  Users,
  Layers,
  ArrowRight,
  Music,
  Coins,
  Shield
} from "lucide-react";

export const ApplicationDiagram = () => {
  const [activeLayer, setActiveLayer] = useState("overview");

  return (
    <div className="w-full space-y-6">
      <Tabs value={activeLayer} onValueChange={setActiveLayer} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="flow">User Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                HiBeats Architecture Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Frontend */}
                <div className="text-center space-y-2">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold">Frontend</h3>
                  <p className="text-sm text-muted-foreground">React + TypeScript</p>
                  <Badge variant="secondary">Web App</Badge>
                </div>

                {/* Backend */}
                <div className="text-center space-y-2">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Server className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold">Backend</h3>
                  <p className="text-sm text-muted-foreground">Smart Contracts</p>
                  <Badge variant="secondary">Blockchain</Badge>
                </div>

                {/* Database */}
                <div className="text-center space-y-2">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <Database className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold">Storage</h3>
                  <p className="text-sm text-muted-foreground">IPFS + Metadata</p>
                  <Badge variant="secondary">Decentralized</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technical Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center space-y-2">
                    <Music className="h-8 w-8 mx-auto text-lime-400" />
                    <h4 className="font-medium">Music Generation</h4>
                    <p className="text-xs text-muted-foreground">AI-powered creation</p>
                  </div>
                  <div className="text-center space-y-2">
                    <Coins className="h-8 w-8 mx-auto text-yellow-400" />
                    <h4 className="font-medium">NFT Minting</h4>
                    <p className="text-xs text-muted-foreground">ERC-721 tokens</p>
                  </div>
                  <div className="text-center space-y-2">
                    <Shield className="h-8 w-8 mx-auto text-blue-400" />
                    <h4 className="font-medium">Wallet Integration</h4>
                    <p className="text-xs text-muted-foreground">Web3 authentication</p>
                  </div>
                  <div className="text-center space-y-2">
                    <Users className="h-8 w-8 mx-auto text-purple-400" />
                    <h4 className="font-medium">Social Features</h4>
                    <p className="text-xs text-muted-foreground">Community interaction</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Journey</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-lime-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                  <p className="text-sm text-center">Connect Wallet</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90 md:rotate-0" />
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-lime-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                  <p className="text-sm text-center">Generate Music</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90 md:rotate-0" />
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-lime-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                  <p className="text-sm text-center">Mint as NFT</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90 md:rotate-0" />
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-lime-500 rounded-full flex items-center justify-center text-white font-bold">4</div>
                  <p className="text-sm text-center">Share & Trade</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};