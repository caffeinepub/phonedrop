import Map "mo:core/Map";
import Time "mo:core/Time";
import Random "mo:core/Random";
import Text "mo:core/Text";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Char "mo:core/Char";
import Iter "mo:core/Iter";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  type ShareEntry = {
    fileName : Text;
    fileSize : Nat;
    mimeType : Text;
    blob : Storage.ExternalBlob;
    timestamp : Time.Time;
  };

  let entries = Map.empty<Text, ShareEntry>();

  func generateShareCode() : async Text {
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let charsIterChars = chars.chars().toArray();
    let random = Random.crypto();
    var code = "";

    for (_ in Nat.range(0, 6)) {
      let index = await* random.natRange(0, 62);
      code #= charsIterChars[index].toText();
    };
    code;
  };

  public shared ({ caller }) func createShare(blob : Storage.ExternalBlob, fileName : Text, fileSize : Nat, mimeType : Text) : async Text {
    let code = await generateShareCode();
    let entry : ShareEntry = {
      fileName;
      fileSize;
      mimeType;
      blob;
      timestamp = Time.now();
    };
    entries.add(code, entry);
    code;
  };

  public query ({ caller }) func getFileInfo(code : Text) : async {
    fileName : Text;
    fileSize : Nat;
    mimeType : Text;
    timestamp : Time.Time;
  } {
    switch (entries.get(code)) {
      case (null) { Runtime.trap("File not found") };
      case (?entry) {
        if (Time.now() - entry.timestamp > 86_400_000_000_000) { // 24 hours in nanoseconds
          Runtime.trap("File has expired");
        };
        {
          fileName = entry.fileName;
          fileSize = entry.fileSize;
          mimeType = entry.mimeType;
          timestamp = entry.timestamp;
        };
      };
    };
  };

  public query ({ caller }) func getBlobReference(code : Text) : async Storage.ExternalBlob {
    switch (entries.get(code)) {
      case (null) { Runtime.trap("File not found") };
      case (?entry) {
        if (Time.now() - entry.timestamp > 86_400_000_000_000) {
          Runtime.trap("File has expired");
        };
        entry.blob;
      };
    };
  };

  public shared ({ caller }) func cleanupExpiredEntries() : async () {
    let expiredCodes = List.empty<Text>();
    for ((code, entry) in entries.entries()) {
      if (Time.now() - entry.timestamp > 86_400_000_000_000) {
        expiredCodes.add(code);
      };
    };

    for (code in expiredCodes.values()) {
      entries.remove(code);
    };
  };
};
