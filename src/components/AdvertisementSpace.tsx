import { Card } from "./ui/card";

const AdvertisementSpace = () => {
  return (
    <Card className="p-4 shadow-playful border-2 border-secondary/20">
      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
        📢 Advertisement
      </h3>
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-4 text-center">
          <p className="text-sm font-medium mb-2">📚 New Books Available!</p>
          <p className="text-xs text-muted-foreground">
            Explore our latest collection of educational materials
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 text-center">
          <p className="text-sm font-medium mb-2">🎨 Art Competition</p>
          <p className="text-xs text-muted-foreground">
            Join our upcoming art contest and win prizes!
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-lg p-4 text-center">
          <p className="text-sm font-medium mb-2">🏆 Quiz Challenge</p>
          <p className="text-xs text-muted-foreground">
            Test your knowledge in our weekly quiz
          </p>
        </div>
      </div>
    </Card>
  );
};

export default AdvertisementSpace;
