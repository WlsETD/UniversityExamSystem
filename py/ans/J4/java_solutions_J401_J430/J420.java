import java.util.*;
public class Main{
    public static void main(String[] args){
        Scanner sc = new Scanner(System.in);
        int m = sc.nextInt();
        switch (m){
            case 3:
            case 4:
            case 5:
                System.out.print("Spring");
                break;
            case 6:
            case 7:
            case 8:
                System.out.print("Summer");
                break;
            case 9:
            case 10:
            case 11:
                System.out.print("Autumn");
                break;
            default:
                System.out.print("Winter");
        }
    }
}
